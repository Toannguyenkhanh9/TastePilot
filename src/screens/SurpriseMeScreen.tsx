import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {getCurrentLocation} from '../services/locationService';
import {resolveCurrentLocation} from '../services/placeService';
import {
  getDailyRecommendations,
  getRestaurantsForMeal,
} from '../services/recommendationService';
import {getCurrentMealType} from '../services/mealPeriodService';
import {MealSuggestion, Restaurant} from '../types';
import {formatDistance, formatMoney} from '../utils/format';
import {formatRestaurantPriceLevel} from '../services/restaurantRankingService';
import {
  checkFeatureAccess,
  grantRewardedFeatureUnlock,
  markFeatureUsed,
} from '../services/usageQuotaService';
import {showRewardedUnlock} from '../services/adService';

type Props = NativeStackScreenProps<RootStackParamList, 'SurpriseMe'>;

export function SurpriseMeScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {
    profile,
    history,
    locationContext,
    setLocationContext,
    isPremium,
  } = useApp();

  const mounted = useRef(true);
  const requestId = useRef(0);

  const [meal, setMeal] = useState<MealSuggestion | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const decide = useCallback(
    async (rotate = false, skipMonetizationGate = false) => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      setError(null);
      setRestaurants([]);

      try {
        if (!skipMonetizationGate) {
          const access = await checkFeatureAccess('surprise', isPremium);
          if (!access.allowed) {
            setLoading(false);
            Alert.alert(t('freeLimitTitle'), t('freeLimitSurpriseText'), [
              {
                text: t('freeLimitWatchAd'),
                onPress: async () => {
                  const earned = await showRewardedUnlock(isPremium);
                  if (earned) {
                    await grantRewardedFeatureUnlock('surprise');
                    decide(rotate, true);
                  } else {
                    Alert.alert(t('freeLimitAdUnavailableTitle'), t('freeLimitAdUnavailableText'));
                  }
                },
              },
              {text: t('freeLimitGoPremium'), onPress: () => navigation.navigate('Premium')},
              {text: t('common.cancel'), style: 'cancel'},
            ]);
            return;
          }
        }
        let resolved = locationContext?.source === 'current'
          ? locationContext
          : null;

        try {
          const coordinates = await getCurrentLocation();
          resolved = await resolveCurrentLocation(
            coordinates,
            profile.currency,
          );
          setLocationContext(resolved);
        } catch {
          // One-tap decision still works from the local catalog if location
          // permission/network is unavailable. Restaurant search then uses the
          // last usable current location if one exists.
        }

        const currency =
          profile.autoCurrency !== false
            ? resolved?.currency || profile.currency
            : profile.currency;

        const requestProfile = {...profile, currency};
        const mealType = getCurrentMealType();

        let suggestions = await getDailyRecommendations({
          budget:
            Number(profile.defaultBudget) > 0
              ? Number(profile.defaultBudget)
              : undefined,
          preferences: [],
          location: resolved?.coordinates,
          locationContext: resolved || undefined,
          history,
          profile: requestProfile,
          mealType,
          mood: profile.recentMood,
          excludeDishNames: rotate ? excluded : [],
        });

        // Surprise Me should remain useful even if the saved default budget is
        // too strict for the current location.
        if (!suggestions.length && Number(profile.defaultBudget) > 0) {
          suggestions = await getDailyRecommendations({
            budget: undefined,
            preferences: [],
            location: resolved?.coordinates,
            locationContext: resolved || undefined,
            history,
            profile: requestProfile,
            mealType,
            mood: profile.recentMood,
            excludeDishNames: rotate ? excluded : [],
          });
        }

        if (!suggestions.length) {
          throw new Error(t('surpriseNoMeal'));
        }

        const chosen = suggestions[0];

        if (!mounted.current || currentRequest !== requestId.current) return;

        setMeal(chosen);
        await markFeatureUsed('surprise', isPremium);
        setExcluded(current => {
          const key = chosen.canonicalName || chosen.name;
          return [...current, key].slice(-8);
        });

        if (!resolved?.coordinates) {
          setError(t('surpriseLocationNeededForPlaces'));
          return;
        }

        setPlacesLoading(true);
        try {
          const places = await getRestaurantsForMeal(
            chosen,
            resolved.coordinates,
          );
          if (!mounted.current || currentRequest !== requestId.current) return;
          setRestaurants(places.slice(0, 3));
        } catch {
          if (!mounted.current || currentRequest !== requestId.current) return;
          setError(t('surprisePlacesUnavailable'));
        } finally {
          if (mounted.current && currentRequest === requestId.current) {
            setPlacesLoading(false);
          }
        }
      } catch (e) {
        if (!mounted.current || currentRequest !== requestId.current) return;
        setError(t('surpriseGenericError'));
      } finally {
        if (mounted.current && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    },
    [
      excluded,
      history,
      locationContext,
      profile,
      setLocationContext,
      t,
      isPremium,
      navigation,
    ],
  );

  useEffect(() => {
    decide(false);
    // Run exactly once when entering. Rerolls are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPlace = (place: Restaurant) => {
    if (!meal) return;
    navigation.navigate('RestaurantDetail', {
      place,
      meal,
      mode: 'daily',
      locationContext: locationContext || undefined,
    });
  };

  if (loading && !meal) {
    return (
      <View style={styles.center}>
        <View style={styles.magicBubble}>
          <Text style={styles.magicEmoji}>✨</Text>
        </View>
        <ActivityIndicator size="large" color="#3568b8" />
        <Text style={styles.loadingTitle}>{t('surpriseThinking')}</Text>
        <Text style={styles.loadingText}>{t('surpriseThinkingText')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>{t('surpriseEyebrow')}</Text>
      <Text style={styles.title}>{t('surpriseTitle')}</Text>
      <Text style={styles.subtitle}>{t('surpriseSubtitle')}</Text>

      {meal ? (
        <View style={styles.mealCard}>
          <View style={styles.mealTop}>
            <View style={styles.iconShell}>
              <FoodAssetIcon meal={meal} size={82} />
            </View>
            <View style={styles.mealCopy}>
              <Text style={styles.decisionLabel}>{t('surpriseDecision')}</Text>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.cuisine}>{meal.cuisine}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            {meal.tasteMatchPercent ? (
              <Text style={styles.matchPill}>
                {t('smartTasteMatch', {percent: meal.tasteMatchPercent})}
              </Text>
            ) : null}
            <Text style={styles.metaPill}>
              {formatMoney(meal.estimatedMin, profile.locale, locationContext?.currency || profile.currency)}
              {' – '}
              {formatMoney(meal.estimatedMax, profile.locale, locationContext?.currency || profile.currency)}
            </Text>
          </View>

          {profile.recentMood ? (
            <Text style={styles.contextLine}>✨ {t('surpriseUsedRecentMood')}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t('surpriseThreePlaces')}</Text>
          <Text style={styles.sectionHint}>{t('surpriseRankedHint')}</Text>
        </View>
        {placesLoading ? <ActivityIndicator color="#3568b8" /> : null}
      </View>

      {restaurants.map((place, index) => (
        <Pressable
          key={place.id}
          style={styles.placeCard}
          onPress={() => openPlace(place)}>
          <View style={styles.rankBubble}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.placeCopy}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeAddress} numberOfLines={2}>{place.address}</Text>
            <View style={styles.placeMeta}>
              {place.smartScore != null ? (
                <Text style={styles.smartPill}>
                  {t('restaurantSmartMatch', {percent: place.smartScore})}
                </Text>
              ) : null}
              <Text style={styles.smallMeta}>⭐ {place.rating.toFixed(1)}</Text>
              {place.distanceMeters != null ? (
                <Text style={styles.smallMeta}>{formatDistance(place.distanceMeters)}</Text>
              ) : null}
              {place.priceLevel ? (
                <Text style={styles.smallMeta}>{formatRestaurantPriceLevel(place.priceLevel)}</Text>
              ) : null}
              {place.openNow != null ? (
                <Text style={[styles.smallMeta, place.openNow ? styles.open : styles.closed]}>
                  {place.openNow ? t('common.open') : t('common.closed')}
                </Text>
              ) : null}
            </View>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      ))}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={() => decide(true)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>✨ {t('surpriseAgain')}</Text>
        )}
      </Pressable>

      {meal ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate('Restaurants', {
              meal,
              mode: 'daily',
              locationContext: locationContext || undefined,
            })
          }>
          <Text style={styles.secondaryText}>{t('surpriseSeeMorePlaces')}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.footnote}>{t('surpriseFootnote')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#fbfaf8',
  },
  magicBubble: {
    width: 86,
    height: 86,
    borderRadius: 30,
    backgroundColor: '#fff1df',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  magicEmoji: {fontSize: 42},
  loadingTitle: {fontSize: 22, fontWeight: '900', color: '#171717', marginTop: 18},
  loadingText: {fontSize: 13, lineHeight: 20, color: '#777', textAlign: 'center', marginTop: 8},
  container: {padding: 20, paddingBottom: 60, backgroundColor: '#fbfaf8', flexGrow: 1},
  kicker: {fontSize: 12, fontWeight: '900', letterSpacing: 1.3, color: '#a86821'},
  title: {fontSize: 34, lineHeight: 40, fontWeight: '900', color: '#171717', marginTop: 7},
  subtitle: {fontSize: 14, lineHeight: 21, color: '#666', marginTop: 8},
  mealCard: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eadfce',
  },
  mealTop: {flexDirection: 'row', alignItems: 'center'},
  iconShell: {
    width: 106,
    height: 106,
    borderRadius: 28,
    backgroundColor: '#fff5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealCopy: {flex: 1, paddingLeft: 16},
  decisionLabel: {fontSize: 11, fontWeight: '900', letterSpacing: 1, color: '#a86821'},
  mealName: {fontSize: 27, lineHeight: 32, fontWeight: '900', color: '#171717', marginTop: 5},
  cuisine: {fontSize: 13, fontWeight: '800', color: '#777', marginTop: 5},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 14},
  matchPill: {
    backgroundColor: '#e8f6ec',
    color: '#237a43',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 7,
    marginBottom: 6,
  },
  metaPill: {
    backgroundColor: '#f5f2ee',
    color: '#6a5c4e',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  contextLine: {fontSize: 11, lineHeight: 17, color: '#866445', fontWeight: '700', marginTop: 4},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22},
  sectionTitle: {fontSize: 17, fontWeight: '900', color: '#222'},
  sectionHint: {fontSize: 12, color: '#777', marginTop: 4},
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginTop: 11,
    borderWidth: 1,
    borderColor: '#e7e0d8',
  },
  rankBubble: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#eef4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {fontSize: 14, fontWeight: '900', color: '#3568b8'},
  placeCopy: {flex: 1},
  placeName: {fontSize: 15, fontWeight: '900', color: '#222'},
  placeAddress: {fontSize: 11, lineHeight: 16, color: '#777', marginTop: 4},
  placeMeta: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
  smartPill: {
    fontSize: 10,
    fontWeight: '900',
    color: '#237a43',
    backgroundColor: '#e8f6ec',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: 'hidden',
    marginRight: 5,
    marginBottom: 4,
  },
  smallMeta: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555',
    backgroundColor: '#f4f4f4',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: 'hidden',
    marginRight: 5,
    marginBottom: 4,
  },
  open: {color: '#237a43', backgroundColor: '#eaf8ee'},
  closed: {color: '#9c4141', backgroundColor: '#fdeeee'},
  arrow: {fontSize: 22, fontWeight: '900', color: '#aaa', marginLeft: 8},
  errorCard: {backgroundColor: '#fff3ee', borderRadius: 16, padding: 13, marginTop: 12},
  errorText: {fontSize: 12, lineHeight: 18, color: '#8a4b36', fontWeight: '700'},
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#3568b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryText: {fontSize: 15, fontWeight: '900', color: '#fff'},
  secondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b9cbe7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryText: {fontSize: 13, fontWeight: '900', color: '#3568b8'},
  pressed: {opacity: 0.82},
  footnote: {fontSize: 11, lineHeight: 17, color: '#888', textAlign: 'center', marginTop: 14},
});
