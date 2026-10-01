import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const mealRef = useRef<MealSuggestion | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const excludedRef = useRef<{names: string[]; ids: string[]; families: string[]}>({
    names: [],
    ids: [],
    families: [],
  });

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const addMealToExcluded = (value: MealSuggestion | null | undefined) => {
    if (!value) return;
    const next = excludedRef.current;
    const name = String(value.canonicalName || value.name || '').trim();
    const id = String(value.canonicalId || '').trim();
    const family = String(value.familyId || '').trim();

    if (name && !next.names.includes(name)) next.names.push(name);
    if (id && !next.ids.includes(id)) next.ids.push(id);
    if (family && !next.families.includes(family)) next.families.push(family);

    next.names = next.names.slice(-12);
    next.ids = next.ids.slice(-12);
    next.families = next.families.slice(-12);
  };

  const isSameMeal = (a: MealSuggestion | null | undefined, b: MealSuggestion | null | undefined) => {
    if (!a || !b) return false;
    if (a.canonicalId && b.canonicalId) return a.canonicalId === b.canonicalId;
    if (a.familyId && b.familyId) return a.familyId === b.familyId;
    return String(a.canonicalName || a.name).trim().toLowerCase() ===
      String(b.canonicalName || b.name).trim().toLowerCase();
  };

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

        const currentMeal = mealRef.current;
        if (rotate) addMealToExcluded(currentMeal);
        const exclusionSnapshot = rotate
          ? {
              names: [...excludedRef.current.names],
              ids: [...excludedRef.current.ids],
              families: [...excludedRef.current.families],
            }
          : {names: [] as string[], ids: [] as string[], families: [] as string[]};

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
          excludeDishNames: exclusionSnapshot.names,
          excludeDishIds: exclusionSnapshot.ids,
          excludeFamilyIds: exclusionSnapshot.families,
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
            excludeDishNames: exclusionSnapshot.names,
            excludeDishIds: exclusionSnapshot.ids,
            excludeFamilyIds: exclusionSnapshot.families,
          });
        }

        if (!suggestions.length) {
          throw new Error(t('surpriseNoMeal'));
        }

        const chosen = rotate
          ? suggestions.find(candidate => !isSameMeal(candidate, currentMeal)) || suggestions[0]
          : suggestions[0];

        if (rotate && isSameMeal(chosen, currentMeal)) {
          throw new Error('SURPRISE_REPEAT_GUARD');
        }

        if (!mounted.current || currentRequest !== requestId.current) return;

        mealRef.current = chosen;
        setMeal(chosen);
        await markFeatureUsed('surprise', isPremium);
        addMealToExcluded(chosen);

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
          <Text style={styles.magicEmoji}>🍜</Text>
        </View>
        <ActivityIndicator size="large" color="#d95f38" />
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
          <View style={styles.heroAccent} />
          <View style={styles.mealTop}>
            <View style={styles.iconShell}>
              <FoodAssetIcon meal={meal} size={126} />
            </View>
            <View style={styles.mealCopy}>
              <View style={styles.decisionBadge}>
                <Text style={styles.decisionLabel}>✦ {t('surpriseDecision')}</Text>
              </View>
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
        {placesLoading ? <ActivityIndicator color="#d95f38" /> : null}
      </View>

      {restaurants.map((place, index) => (
        <Pressable
          key={place.id}
          style={({pressed}) => [styles.placeCard, pressed && styles.placeCardPressed]}
          onPress={() => openPlace(place)}>
          <View style={styles.placeVisual}>
            {place.imageUrl ? (
              <Image source={{uri: place.imageUrl}} style={styles.placeImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeImageFallback}>
                {meal ? <FoodAssetIcon meal={meal} size={54} /> : <Text style={styles.fallbackEmoji}>🍽️</Text>}
              </View>
            )}
            <View style={styles.rankBubble}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
          </View>
          <View style={styles.placeCopy}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeAddress} numberOfLines={2}>⌖ {place.address}</Text>
            <View style={styles.placeMeta}>
              {place.smartScore != null ? (
                <Text style={styles.smartPill}>
                  🌿 {t('restaurantSmartMatch', {percent: place.smartScore})}
                </Text>
              ) : null}
              <Text style={styles.smallMeta}>⭐ {place.rating.toFixed(1)}</Text>
              {place.distanceMeters != null ? (
                <Text style={styles.smallMeta}>⌖ {formatDistance(place.distanceMeters)}</Text>
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
          <Text style={styles.arrow}>›</Text>
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
          <Text style={styles.primaryText}>↝  {t('surpriseAgain')}  ✦</Text>
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
    backgroundColor: '#fff9f1',
  },
  magicBubble: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: '#ffead9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  magicEmoji: {fontSize: 42},
  loadingTitle: {fontSize: 22, fontWeight: '900', color: '#251c17', marginTop: 18},
  loadingText: {fontSize: 13, lineHeight: 20, color: '#7d6f66', textAlign: 'center', marginTop: 8},
  container: {padding: 18, paddingBottom: 60, backgroundColor: '#fff9f1', flexGrow: 1},
  kicker: {fontSize: 12, fontWeight: '900', letterSpacing: 1.4, color: '#c5522f'},
  title: {fontSize: 36, lineHeight: 42, fontWeight: '900', color: '#201713', marginTop: 7},
  subtitle: {fontSize: 14, lineHeight: 21, color: '#73665e', marginTop: 7, maxWidth: 520},
  mealCard: {
    marginTop: 20,
    backgroundColor: '#fffdf9',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1dccb',
    overflow: 'hidden',
    shadowColor: '#9d593d',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 3,
  },
  heroAccent: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff0dc',
    left: -54,
    top: -48,
  },
  mealTop: {flexDirection: 'row', alignItems: 'center'},
  iconShell: {
    width: 150,
    height: 150,
    borderRadius: 34,
    backgroundColor: '#ffead2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mealCopy: {flex: 1, paddingLeft: 16},
  decisionBadge: {alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#ffead8', paddingHorizontal: 9, paddingVertical: 6},
  decisionLabel: {fontSize: 10, fontWeight: '900', letterSpacing: 0.7, color: '#bd4f2d'},
  mealName: {fontSize: 28, lineHeight: 32, fontWeight: '900', color: '#211713', marginTop: 9},
  cuisine: {fontSize: 13, fontWeight: '700', color: '#7a6c63', marginTop: 6},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 15},
  matchPill: {
    backgroundColor: '#e8f4df',
    color: '#367a43',
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
    backgroundColor: '#f6efe7',
    color: '#755b47',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  contextLine: {fontSize: 11, lineHeight: 17, color: '#9c684c', fontWeight: '700', marginTop: 4},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26},
  sectionTitle: {fontSize: 19, fontWeight: '900', color: '#281d18'},
  sectionHint: {fontSize: 12, lineHeight: 18, color: '#81746b', marginTop: 4, paddingRight: 18},
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdf9',
    borderRadius: 22,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee0d5',
    shadowColor: '#7f4b34',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 2,
  },
  placeCardPressed: {transform: [{scale: 0.99}], opacity: 0.92},
  placeVisual: {width: 84, height: 84, borderRadius: 18, marginRight: 12},
  placeImage: {width: 84, height: 84, borderRadius: 18, backgroundColor: '#f8eadc'},
  placeImageFallback: {width: 84, height: 84, borderRadius: 18, backgroundColor: '#fff0df', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'},
  fallbackEmoji: {fontSize: 30},
  rankBubble: {
    position: 'absolute',
    left: -5,
    top: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d95f38',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fffdf9',
  },
  rankText: {fontSize: 13, fontWeight: '900', color: '#fff'},
  placeCopy: {flex: 1},
  placeName: {fontSize: 15, lineHeight: 19, fontWeight: '900', color: '#291d18'},
  placeAddress: {fontSize: 11, lineHeight: 16, color: '#84766e', marginTop: 4},
  placeMeta: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
  smartPill: {
    fontSize: 10,
    fontWeight: '900',
    color: '#327442',
    backgroundColor: '#e8f4df',
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
    color: '#665b54',
    backgroundColor: '#f5f0eb',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: 'hidden',
    marginRight: 5,
    marginBottom: 4,
  },
  open: {color: '#327442', backgroundColor: '#e7f5e7'},
  closed: {color: '#9c4141', backgroundColor: '#fdeeee'},
  arrow: {fontSize: 31, lineHeight: 34, fontWeight: '500', color: '#b47b64', marginLeft: 5, marginRight: 2},
  errorCard: {backgroundColor: '#fff3ee', borderRadius: 16, padding: 13, marginTop: 12},
  errorText: {fontSize: 12, lineHeight: 18, color: '#8a4b36', fontWeight: '700'},
  primaryButton: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: '#d95f38',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#b84125',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  primaryText: {fontSize: 16, fontWeight: '900', color: '#fff'},
  secondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#fffaf5',
    borderWidth: 1.5,
    borderColor: '#e09578',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryText: {fontSize: 13, fontWeight: '900', color: '#c55331'},
  pressed: {opacity: 0.82},
  footnote: {fontSize: 11, lineHeight: 17, color: '#8d8078', textAlign: 'center', marginTop: 14},
});
