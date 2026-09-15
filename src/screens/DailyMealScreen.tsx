import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {Chip} from '../components/Chip';
import {PrimaryButton} from '../components/PrimaryButton';
import {LocationSummary} from '../components/LocationSummary';
import {LocalBanner} from '../components/LocalBanner';
import {MealTypeSelector} from '../components/MealTypeSelector';
import {BudgetControl} from '../components/BudgetControl';
import {getCurrentLocation} from '../services/locationService';
import {resolveCurrentLocation} from '../services/placeService';
import {getDailyRecommendations} from '../services/recommendationService';
import {LocationContext, MealTypeSelection} from '../types';
import {resolveMealType} from '../services/mealPeriodService';
import {formatBudgetInput, parseBudgetInput} from '../utils/budgetInput';
import {APP_LOCAL_BANNERS} from '../utils/localArt';

const optionDefs = [
  {id: 'Healthy', labelKey: 'daily.prefs.healthy'},
  {id: 'High Protein', labelKey: 'daily.prefs.highProtein'},
  {id: 'Vegetarian', labelKey: 'daily.prefs.vegetarian'},
  {id: 'Quick Meal', labelKey: 'daily.prefs.quickMeal'},
  {id: 'Something New', labelKey: 'daily.prefs.somethingNew'},
];

type Props = NativeStackScreenProps<RootStackParamList, 'DailyMeal'>;

export function DailyMealScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {profile, history, locationContext, setLocationContext} = useApp();
  const scrollRef = useRef<ScrollView>(null);
  const [budgetY, setBudgetY] = useState(0);
  const [budget, setBudget] = useState(formatBudgetInput(profile.defaultBudget, profile.locale));
  const [budgetEnabled, setBudgetEnabled] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [mealTypeSelection, setMealTypeSelection] = useState<MealTypeSelection>('auto');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [activeLocation, setActiveLocation] = useState<LocationContext | null>(
    locationContext?.source === 'current' ? locationContext : null,
  );

  const resolvedMealType = resolveMealType(mealTypeSelection);

  const activeCurrency =
    profile.autoCurrency !== false ? activeLocation?.currency || profile.currency : profile.currency;

  const toggle = (value: string) =>
    setSelected(prev =>
      prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value],
    );

  const revealBudgetInput = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, budgetY - 24),
        animated: true,
      });
    }, Platform.OS === 'android' ? 220 : 120);
  };

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const coordinates = await getCurrentLocation();
      const resolved = await resolveCurrentLocation(coordinates, profile.currency);
      setActiveLocation(resolved);
      setLocationContext(resolved);
      return resolved;
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    detectLocation().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    const amount = budgetEnabled ? parseBudgetInput(budget) : undefined;
    if (budgetEnabled && (!amount || amount <= 0)) {
      Alert.alert(
        t('daily.invalidBudgetTitle'),
        t('daily.invalidBudgetText', {currency: activeCurrency}),
      );
      return;
    }

    setLoading(true);
    try {
      const resolved = activeLocation || (await detectLocation().catch(() => null));
      const requestCurrency =
        profile.autoCurrency !== false
          ? resolved?.currency || profile.currency
          : profile.currency;
      const requestProfile = {...profile, currency: requestCurrency};

      const suggestions = await getDailyRecommendations({
        budget: amount,
        preferences: selected,
        location: resolved?.coordinates,
        locationContext: resolved || undefined,
        history,
        profile: requestProfile,
        mealType: resolvedMealType,
      });

      if (!suggestions.length) {
        Alert.alert(t('budgetNoMatchTitle'), t('budgetNoMatchText'));
        return;
      }

      navigation.navigate('MealResults', {
        mode: 'daily',
        title: t('daily.routeTitle'),
        suggestions,
        currency: requestCurrency,
        locale: profile.locale,
        locationContext: resolved || undefined,
        requestContext: {
          mode: 'daily',
          budget: amount,
          preferences: selected,
          location: resolved?.coordinates,
          locationContext: resolved || undefined,
          history,
          profile: requestProfile,
          mealType: resolvedMealType,
        },
      });
    } catch (e) {
      Alert.alert(
        t('mealResults.couldNotRefreshTitle'),
        e instanceof Error ? e.message : 'Unknown error',
      );
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
          imageSource={APP_LOCAL_BANNERS.daily}
          eyebrow={t('daily.heroEyebrow')}
          title={t('daily.heroTitle')}
          subtitle={t('daily.heroSubtitle')}
          height={210}
        />

        <LocationSummary
          value={activeLocation}
          loading={detecting}
          onRefresh={() => detectLocation().catch(() => undefined)}
          title={t('daily.yourArea')}
        />

        <MealTypeSelector
          value={mealTypeSelection}
          onChange={setMealTypeSelection}
          mode="daily"
        />

        <View onLayout={event => setBudgetY(event.nativeEvent.layout.y)} style={styles.budgetBlock}>
          <BudgetControl
            currency={activeCurrency}
            locale={profile.locale}
            enabled={budgetEnabled}
            value={budget}
            onEnabledChange={setBudgetEnabled}
            onChangeText={value => setBudget(formatBudgetInput(value, profile.locale))}
            onFocus={revealBudgetInput}
            placeholder={
              activeCurrency === profile.currency
                ? formatBudgetInput(profile.defaultBudget, profile.locale)
                : t('budgetPlaceholder', {currency: activeCurrency})
            }
          />
        </View>

        <Text style={styles.label}>{t('daily.optionalPreferences')}</Text>
        <View style={styles.chips}>
          {optionDefs.map(option => (
            <Chip
              key={option.id}
              label={t(option.labelKey)}
              selected={selected.includes(option.id)}
              onPress={() => toggle(option.id)}
            />
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('daily.howItWorksTitle')}</Text>
          <Text style={styles.infoText}>{t('daily.howItWorksText')}</Text>
        </View>

        <PrimaryButton title={t('daily.button')} onPress={submit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#fbfaf8'},
  container: {padding: 20, paddingBottom: 120, backgroundColor: '#fbfaf8', flexGrow: 1},
  budgetBlock: {marginTop: 2},
  label: {fontSize: 14, fontWeight: '800', color: '#303030', marginTop: 10, marginBottom: 10},
  input: {
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eadfd7',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '800',
    color: '#171717',
  },
  currencyHint: {fontSize: 12, lineHeight: 18, color: '#6c7890', marginTop: 8},
  chips: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14},
  infoCard: {backgroundColor: '#fff2df', borderRadius: 20, padding: 16, marginBottom: 24},
  infoTitle: {fontSize: 15, fontWeight: '800', color: '#171717'},
  infoText: {fontSize: 13, color: '#666', lineHeight: 19, marginTop: 6},
});
