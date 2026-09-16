import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {PrimaryButton} from '../components/PrimaryButton';
import {Chip} from '../components/Chip';
import {LocationSummary} from '../components/LocationSummary';
import {LocalBanner} from '../components/LocalBanner';
import {MealTypeSelector} from '../components/MealTypeSelector';
import {BudgetControl} from '../components/BudgetControl';
import {getCurrentLocation} from '../services/locationService';
import {resolveCurrentLocation, resolveDestination} from '../services/placeService';
import {getTravelRecommendations} from '../services/recommendationService';
import {LocationContext, MealTypeSelection, TravelGuideCategory} from '../types';
import {resolveMealType} from '../services/mealPeriodService';
import {formatBudgetInput, parseBudgetInput} from '../utils/budgetInput';
import {APP_LOCAL_BANNERS} from '../utils/localArt';
import {
  checkFeatureAccess,
  grantRewardedFeatureUnlock,
  markFeatureUsed,
} from '../services/usageQuotaService';
import {showRewardedUnlock} from '../services/adService';

const travelGuideDefs: Array<{id: TravelGuideCategory; labelKey: string; hintKey: string}> = [
  {id: 'must_try', labelKey: 'travelCatMustTry', hintKey: 'travelHintMustTry'},
  {id: 'street_food', labelKey: 'travelCatStreetFood', hintKey: 'travelHintStreetFood'},
  {id: 'hidden_gems', labelKey: 'travelCatHiddenGems', hintKey: 'travelHintHiddenGems'},
  {id: 'dessert', labelKey: 'travelCatDessert', hintKey: 'travelHintDessert'},
];

type Props = NativeStackScreenProps<RootStackParamList, 'TravelFood'>;

export function TravelFoodScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {profile, history, locationContext, setLocationContext, isPremium} = useApp();
  const scrollRef = useRef<ScrollView>(null);
  const [destinationY, setDestinationY] = useState(0);
  const [budgetY, setBudgetY] = useState(0);
  const [budget, setBudget] = useState(formatBudgetInput(profile.defaultBudget, profile.locale));
  const [budgetEnabled, setBudgetEnabled] = useState(true);
  const [destination, setDestination] = useState('');
  const [useCurrent, setUseCurrent] = useState(true);
  const [mealTypeSelection, setMealTypeSelection] = useState<MealTypeSelection>('auto');
  const [travelCategory, setTravelCategory] = useState<TravelGuideCategory>('must_try');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [currentContext, setCurrentContext] = useState<LocationContext | null>(
    locationContext?.source === 'current' ? locationContext : null,
  );
  const [destinationContext, setDestinationContext] = useState<LocationContext | null>(null);

  const activeContext = useCurrent ? currentContext : destinationContext;
  const resolvedMealType = resolveMealType(mealTypeSelection);
  const activeCurrency =
    profile.autoCurrency !== false ? activeContext?.currency || profile.currency : profile.currency;

  const revealField = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 24),
        animated: true,
      });
    }, Platform.OS === 'android' ? 220 : 120);
  };

  const detectCurrent = async () => {
    setDetecting(true);
    try {
      const coordinates = await getCurrentLocation();
      const resolved = await resolveCurrentLocation(coordinates, profile.currency);
      setCurrentContext(resolved);
      setLocationContext(resolved);
      return resolved;
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    detectCurrent().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDestination = async () => {
    const value = destination.trim();
    if (!value) {
      return Alert.alert(t('travel.enterDestinationTitle'), t('travel.enterDestinationText'));
    }

    setDetecting(true);
    try {
      const resolved = await resolveDestination(value, profile.currency);
      setDestinationContext(resolved);
      return resolved;
    } catch (e) {
      Alert.alert(t('travel.couldNotFindDestination'), e instanceof Error ? e.message : 'Unknown error');
      return undefined;
    } finally {
      setDetecting(false);
    }
  };

  const submit = async (skipMonetizationGate = false) => {
    if (!useCurrent && !destination.trim()) {
      return Alert.alert(t('travel.enterDestinationTitle'), t('travel.enterDestinationText'));
    }

    setLoading(true);
    try {
      let resolved = activeContext;
      if (useCurrent && !resolved) resolved = await detectCurrent();
      if (!useCurrent && !resolved) {
        const found = await resolveDestination(destination.trim(), profile.currency);
        setDestinationContext(found);
        resolved = found;
      }

      const amount = budgetEnabled ? parseBudgetInput(budget) : undefined;
      const currency =
        profile.autoCurrency !== false ? resolved?.currency || profile.currency : profile.currency;
      if (budgetEnabled && (!amount || amount <= 0)) {
        Alert.alert(t('travel.invalidBudgetTitle'), t('travel.invalidBudgetText', {currency}));
        return;
      }

      if (!skipMonetizationGate) {
        const access = await checkFeatureAccess('travel', isPremium);
        if (!access.allowed) {
          Alert.alert(
            t('freeLimitTitle'),
            t('freeLimitTravelText'),
            [
              {
                text: t('freeLimitWatchAd'),
                onPress: async () => {
                  const earned = await showRewardedUnlock(isPremium);
                  if (earned) {
                    await grantRewardedFeatureUnlock('travel');
                    submit(true);
                  } else {
                    Alert.alert(t('freeLimitAdUnavailableTitle'), t('freeLimitAdUnavailableText'));
                  }
                },
              },
              {text: t('freeLimitGoPremium'), onPress: () => navigation.navigate('Premium')},
              {text: t('common.cancel'), style: 'cancel'},
            ],
          );
          return;
        }
      }

      const destinationLabel = useCurrent ? undefined : destination.trim();
      const requestProfile = {...profile, currency};
      const suggestions = await getTravelRecommendations({
        budget: amount,
        destination: destinationLabel,
        location: resolved?.coordinates,
        locationContext: resolved || undefined,
        profile: requestProfile,
        history,
        mealType: resolvedMealType,
        travelCategory,
      });

      if (!suggestions.length) {
        Alert.alert(t('budgetNoMatchTitle'), t('budgetNoMatchText'));
        return;
      }

      await markFeatureUsed('travel', isPremium);

      const resolvedTitle = [resolved?.city, resolved?.country].filter(Boolean).join(', ');
      const selectedGuide = travelGuideDefs.find(item => item.id === travelCategory) || travelGuideDefs[0];
      const categoryLabel = t(selectedGuide.labelKey);
      const areaLabel = resolvedTitle || destination.trim();
      navigation.navigate('MealResults', {
        mode: 'travel',
        title: areaLabel
          ? t('smartTravelResultsTitle', {category: categoryLabel, area: areaLabel})
          : categoryLabel,
        suggestions,
        destination: destinationLabel,
        currency,
        locale: profile.locale,
        locationContext: resolved || undefined,
        requestContext: {
          mode: 'travel',
          budget: amount,
          destination: destinationLabel,
          location: resolved?.coordinates,
          locationContext: resolved || undefined,
          profile: requestProfile,
          history,
          mealType: resolvedMealType,
          travelCategory,
        },
      });
    } catch (e) {
      Alert.alert(t('travel.couldNotExploreArea'), e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
        <LocalBanner
          imageSource={APP_LOCAL_BANNERS.travel}
          eyebrow={t('travel.heroEyebrow')}
          title={t('travel.heroTitle')}
          subtitle={t('travel.heroSubtitle')}
          height={210}
        />

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentItem, useCurrent && styles.segmentActive]}
            onPress={() => setUseCurrent(true)}>
            <Text style={[styles.segmentText, useCurrent && styles.segmentTextActive]}>
              {t('common.currentLocation')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentItem, !useCurrent && styles.segmentActive]}
            onPress={() => setUseCurrent(false)}>
            <Text style={[styles.segmentText, !useCurrent && styles.segmentTextActive]}>
              {t('common.searchDestination')}
            </Text>
          </Pressable>
        </View>

        {useCurrent ? (
          <LocationSummary
            value={currentContext}
            loading={detecting}
            onRefresh={() => detectCurrent().catch(() => undefined)}
            title={t('travel.exploringTitle')}
          />
        ) : (
          <View onLayout={event => setDestinationY(event.nativeEvent.layout.y)}>
            <Text style={styles.label}>{t('common.destination')}</Text>
            <View style={styles.destinationRow}>
              <TextInput
                style={[styles.input, styles.destinationInput]}
                value={destination}
                onFocus={() => revealField(destinationY)}
                onChangeText={value => {
                  setDestination(value);
                  setDestinationContext(null);
                }}
                placeholder={t('travel.destinationPlaceholder')}
                placeholderTextColor="#aaa"
              />
              <Pressable style={styles.checkButton} onPress={() => checkDestination()} disabled={detecting}>
                <Text style={styles.checkButtonText}>
                  {detecting ? t('common.loadingDots') : t('common.check')}
                </Text>
              </Pressable>
            </View>
            {destinationContext ? (
              <LocationSummary value={destinationContext} title={t('travel.destinationTitle')} />
            ) : null}
          </View>
        )}

        <MealTypeSelector
          value={mealTypeSelection}
          onChange={setMealTypeSelection}
          mode="travel"
        />

        <View style={styles.guidePanel}>
          <Text style={styles.guideTitle}>{t('smartTravelGuideTitle')}</Text>
          <Text style={styles.guideText}>{t('smartTravelGuideHint')}</Text>
          <View style={styles.guideChips}>
            {travelGuideDefs.map(item => (
              <Chip
                key={item.id}
                label={t(item.labelKey)}
                selected={travelCategory === item.id}
                onPress={() => setTravelCategory(item.id)}
              />
            ))}
          </View>
          <Text style={styles.guideHint}>
            {t((travelGuideDefs.find(item => item.id === travelCategory) || travelGuideDefs[0]).hintKey)}
          </Text>
        </View>

        <View onLayout={event => setBudgetY(event.nativeEvent.layout.y)}>
          <BudgetControl
            currency={activeCurrency}
            locale={profile.locale}
            enabled={budgetEnabled}
            value={budget}
            onEnabledChange={setBudgetEnabled}
            onChangeText={value => setBudget(formatBudgetInput(value, profile.locale))}
            onFocus={() => revealField(budgetY)}
            placeholder={t('budgetPlaceholder', {currency: activeCurrency})}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('travel.rankingTitle')}</Text>
          <Text style={styles.panelText}>{t('travel.rankingText')}</Text>
        </View>

        <PrimaryButton title={t('travel.button')} onPress={submit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#fbfaf8'},
  container: {padding: 20, paddingBottom: 120, backgroundColor: '#fbfaf8', flexGrow: 1},
  segment: {flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 18, padding: 4, marginTop: 2},
  segmentItem: {flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center'},
  segmentActive: {backgroundColor: '#fff'},
  segmentText: {fontWeight: '700', color: '#777', fontSize: 13},
  segmentTextActive: {color: '#171717'},
  label: {fontSize: 14, fontWeight: '800', color: '#303030', marginTop: 24, marginBottom: 10},
  destinationRow: {flexDirection: 'row'},
  destinationInput: {flex: 1, marginRight: 10},
  input: {
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dedede',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#171717',
  },
  checkButton: {
    height: 58,
    minWidth: 78,
    borderRadius: 18,
    backgroundColor: '#1d2735',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  checkButtonText: {fontSize: 13, fontWeight: '900', color: '#fff'},
  guidePanel: {backgroundColor: '#fff8ed', borderRadius: 20, padding: 16, marginTop: 10, borderWidth: 1, borderColor: '#f0dfc7'},
  guideTitle: {fontSize: 15, fontWeight: '900', color: '#2b2b2b'},
  guideText: {fontSize: 12, lineHeight: 18, color: '#6b6259', marginTop: 5},
  guideChips: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  guideHint: {fontSize: 12, lineHeight: 18, color: '#94601d', fontWeight: '700', marginTop: 4},
  panel: {backgroundColor: '#eaf3ff', borderRadius: 20, padding: 16, marginVertical: 24},
  panelTitle: {fontSize: 15, fontWeight: '800', color: '#1f3560'},
  panelText: {fontSize: 13, color: '#50668d', lineHeight: 20, marginTop: 6},
});
