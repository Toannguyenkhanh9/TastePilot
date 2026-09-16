import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {formatMoney} from '../utils/format';
import {getDailyRecommendations, getTravelRecommendations} from '../services/recommendationService';
import {getGroupRecommendations} from '../services/groupRecommendationService';
import {MealSuggestion} from '../types';
import {APP_LOCAL_BANNERS, getMealLocalArt} from '../utils/localArt';
import {LocalBanner} from '../components/LocalBanner';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {useApp} from '../context/AppContext';
import {checkFeatureAccess, grantRewardedFeatureUnlock, markFeatureUsed, MeteredFeature} from '../services/usageQuotaService';
import {showRewardedUnlock} from '../services/adService';

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function uniqueNames(values: string[]) {
  return Array.from(new Set(values.map(x => x.trim()).filter(Boolean)));
}

export function MealResultsScreen({route, navigation}: NativeStackScreenProps<RootStackParamList, 'MealResults'>) {
  const {t} = useTranslation();
  const {isPremium} = useApp();
  const {title, mode, destination, currency, locale, locationContext, requestContext} = route.params;
  const [suggestions, setSuggestions] = useState(route.params.suggestions);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);

  const ensureMeteredAccess = async (feature: MeteredFeature) => {
    const access = await checkFeatureAccess(feature, isPremium);
    if (access.allowed) return true;

    return new Promise<boolean>(resolve => {
      Alert.alert(
        t('freeLimitTitle'),
        t(feature === 'daily' ? 'freeLimitDailyText' : 'freeLimitTravelText'),
        [
          {
            text: t('freeLimitWatchAd'),
            onPress: async () => {
              const earned = await showRewardedUnlock(isPremium);
              if (!earned) {
                Alert.alert(t('freeLimitAdUnavailableTitle'), t('freeLimitAdUnavailableText'));
                resolve(false);
                return;
              }
              await grantRewardedFeatureUnlock(feature);
              resolve(true);
            },
          },
          {
            text: t('freeLimitGoPremium'),
            onPress: () => {
              navigation.navigate('Premium');
              resolve(false);
            },
          },
          {text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false)},
        ],
        {cancelable: true, onDismiss: () => resolve(false)},
      );
    });
  };

  const fetchFreshSuggestions = async (excludeDishNames: string[]) => {
    if (requestContext.groupSession) {
      return getGroupRecommendations({
        session: requestContext.groupSession,
        profile: requestContext.profile,
        history: requestContext.history || [],
        locationContext: requestContext.locationContext,
        excludeDishNames,
        limit: 5,
      });
    }

    const feature: MeteredFeature = requestContext.mode === 'daily' ? 'daily' : 'travel';
    const allowed = await ensureMeteredAccess(feature);
    if (!allowed) return [];

    const fresh = requestContext.mode === 'daily'
      ? await getDailyRecommendations({
          budget: requestContext.budget,
          preferences: requestContext.preferences || [],
          location: requestContext.location,
          locationContext: requestContext.locationContext,
          history: requestContext.history || [],
          profile: requestContext.profile,
          mealType: requestContext.mealType,
          mood: requestContext.mood,
          excludeDishNames,
        })
      : await getTravelRecommendations({
          budget: requestContext.budget,
          destination: requestContext.destination,
          location: requestContext.location,
          locationContext: requestContext.locationContext,
          profile: requestContext.profile,
          history: requestContext.history || [],
          mealType: requestContext.mealType,
          travelCategory: requestContext.travelCategory,
          excludeDishNames,
        });

    if (fresh.length) await markFeatureUsed(feature, isPremium);
    return fresh;
  };

  const rerollAll = async () => {
    setRefreshing(true);
    try {
      const excludeDishNames = uniqueNames([...dismissed, ...suggestions.map(x => x.name)]);
      const fresh = await fetchFreshSuggestions(excludeDishNames);
      const next = fresh.filter(
        item =>
          !excludeDishNames.some(
            name => normalizeName(name) === normalizeName(item.name),
          ),
      );

      if (!next.length) {
        Alert.alert(
          t('mealResults.noMoreIdeasTitle'),
          t('mealResults.noMoreIdeasText'),
        );
        return;
      }

      setDismissed(excludeDishNames);
      setSuggestions(next.slice(0, 5));
    } catch (e) {
      Alert.alert(
        t('mealResults.couldNotRefreshTitle'),
        e instanceof Error ? e.message : 'Unknown error',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const swapOne = async (meal: MealSuggestion) => {
    setSwappingId(meal.id);

    try {
      const remaining = suggestions.filter(x => x.id !== meal.id);
      const excludeDishNames = uniqueNames([
        ...dismissed,
        meal.name,
        ...remaining.map(x => x.name),
      ]);

      const fresh = await fetchFreshSuggestions(excludeDishNames);
      const replacement = fresh.find(
        item =>
          !excludeDishNames.some(
            name => normalizeName(name) === normalizeName(item.name),
          ),
      );

      if (!replacement) {
        Alert.alert(
          t('mealResults.noReplacementTitle'),
          t('mealResults.noReplacementText'),
        );
        return;
      }

      setDismissed(uniqueNames([...dismissed, meal.name]));
      setSuggestions([...remaining, replacement].slice(0, 5));
    } catch (e) {
      Alert.alert(
        t('mealResults.couldNotSwapTitle'),
        e instanceof Error ? e.message : 'Unknown error',
      );
    } finally {
      setSwappingId(null);
    }
  };

  return (
    <ImageBackground
      source={
        mode === 'travel'
          ? APP_LOCAL_BANNERS.resultsTravel
          : APP_LOCAL_BANNERS.resultsDaily
      }
      style={styles.screen}
      imageStyle={styles.screenBg}>
      <View style={styles.screenOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <LocalBanner
          imageSource={
            mode === 'travel'
              ? APP_LOCAL_BANNERS.resultsTravel
              : APP_LOCAL_BANNERS.resultsDaily
          }
          eyebrow={mode === 'travel' ? t('mealResults.heroEyebrowTravel') : t('mealResults.heroEyebrowDaily')}
          title={title}
          subtitle={t('mealResults.heroSubtitle')}
          height={198}
        />

        <Pressable
          style={({pressed}) => [
            styles.refreshButton,
            pressed && styles.pressed,
            refreshing && styles.disabled,
          ]}
          onPress={rerollAll}
          disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator color="#171717" />
          ) : (
            <>
              <Text style={styles.refreshIcon}>↻</Text>
              <Text style={styles.refreshText}>{t('mealResults.tryAnother5')}</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.listLabel}>{t('mealResults.suggestionsCount', {count: suggestions.length})}</Text>

        {suggestions.map((meal, index) => {
          const art = getMealLocalArt(meal);
          const priceRange =
            `${formatMoney(meal.estimatedMin, locale, currency)} – ` +
            `${formatMoney(meal.estimatedMax, locale, currency)}`;

          return (
            <View key={meal.id} style={styles.card}>
              <View
                style={[
                  styles.foodVisual,
                  {backgroundColor: art.accentSoft},
                ]}>
                <View style={styles.visualTopRow}>
                  <Text
                    style={[
                      styles.pickBadge,
                      {
                        color: art.accent,
                        borderColor: `${art.accent}22`,
                      },
                    ]}>
                    {meal.localSpecialty ? t('mealResults.localPick') : t('mealResults.pickNumber', {number: index + 1})}
                  </Text>

                  <Text style={styles.pricePill}>{priceRange}</Text>
                </View>

                <View style={styles.visualMain}>
                  <View style={styles.foodImageShell}>
                    <FoodAssetIcon meal={meal} size={126} rounded={false} />
                  </View>

                  <View style={styles.visualCopy}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.cuisine}>{meal.cuisine}</Text>
                    <Text style={[styles.foodType, {color: art.accent}]}>
                      {t(`foodLabels.${art.labelKey}`)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.reason}>{meal.reason}</Text>

                <View style={styles.quickMetaRow}>
                  {meal.tasteMatchPercent ? (
                    <View style={styles.matchPill}>
                      <Text style={styles.matchPillText}>
                        {meal.groupMatchPercent ? t('groupMatch', {percent: meal.groupMatchPercent}) : t('smartTasteMatch', {percent: meal.tasteMatchPercent})}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.quickMetaPill}>
                    <Text style={styles.quickMetaText}>
                      {meal.localSpecialty ? t('mealResults.localSpecialty') : t('mealResults.smartBudgetFit')}
                    </Text>
                  </View>

                  <View style={styles.quickMetaPillMuted}>
                    <Text style={styles.quickMetaTextMuted}>
                      {t('mealResults.nearbySearchReady')}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={({pressed}) => [
                      styles.secondaryButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => swapOne(meal)}
                    disabled={swappingId === meal.id || refreshing}>
                    {swappingId === meal.id ? (
                      <ActivityIndicator size="small" color="#444" />
                    ) : (
                      <Text style={styles.secondaryText}>{t('mealResults.replace')}</Text>
                    )}
                  </Pressable>

                  <Pressable
                    style={({pressed}) => [
                      styles.primaryButton,
                      {backgroundColor: art.accent},
                      pressed && styles.pressed,
                    ]}
                    onPress={() =>
                      navigation.navigate('Restaurants', {
                        meal,
                        mode,
                        destination,
                        locationContext,
                      })
                    }>
                    <Text style={styles.primaryText}>{t('mealResults.findPlaces')}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6efe6',
  },
  screenBg: {
    opacity: 0.14,
  },
  screenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249,246,241,0.95)',
  },
  container: {
    padding: 20,
    paddingBottom: 42,
  },

  refreshButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e7ddcf',
    backgroundColor: 'rgba(255,255,255,0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  refreshIcon: {
    marginRight: 8,
    fontSize: 22,
    fontWeight: '900',
    color: '#171717',
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#171717',
  },
  listLabel: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#2b2b2b',
  },

  card: {
    marginTop: 10,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eadfce',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 2,
  },

  foodVisual: {
    minHeight: 215,
    padding: 16,
  },
  visualTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickBadge: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  pricePill: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: '900',
    color: '#3b3129',
  },

  visualMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
  },
  foodImageShell: {
    width: 142,
    height: 142,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
    elevation: 2,
  },
  visualCopy: {
    flex: 1,
    paddingLeft: 16,
  },
  mealName: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
    color: '#171717',
  },
  cuisine: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: '800',
    color: '#5f5f5f',
  },
  foodType: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '900',
  },

  cardBody: {
    padding: 18,
  },
  reason: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555',
  },
  matchPill: {backgroundColor: '#e9f7ee', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, marginBottom: 8},
  matchPillText: {fontSize: 11, fontWeight: '900', color: '#237a43'},
  quickMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  quickMetaPill: {
    borderRadius: 999,
    backgroundColor: '#fff4e6',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  quickMetaPillMuted: {
    borderRadius: 999,
    backgroundColor: '#f3f5f8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  quickMetaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94612c',
  },
  quickMetaTextMuted: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5b6470',
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
  },
  secondaryButton: {
    minHeight: 50,
    minWidth: 120,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.6,
  },
});