import React, {useMemo, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import type {RootStackParamList} from '../navigation/types';
import {BRANDING_ASSETS} from '../utils/localArt';
import {ONBOARDING_DONE_STORAGE_KEY} from '../constants/onboarding';
import {formatBudgetInput, parseBudgetInput} from '../utils/budgetInput';
import {useApp} from '../context/AppContext';
import i18n, {
  SUPPORTED_LANGUAGES,
  localeToLanguageCode,
} from '../i18n';

type StepKey = 'welcome' | 'preferences' | 'budget' | 'location';

const stepDefs: Array<{
  key: StepKey;
  titleKey: string;
  subtitleKey: string;
  image: any;
}> = [
  {
    key: 'welcome',
    titleKey: 'onboardingWelcomeTitle',
    subtitleKey: 'onboardingWelcomeSubtitle',
    image: BRANDING_ASSETS.onboardingPreferences,
  },
  {
    key: 'preferences',
    titleKey: 'onboardingPreferencesTitle',
    subtitleKey: 'onboardingPreferencesSubtitle',
    image: BRANDING_ASSETS.onboardingPreferences,
  },
  {
    key: 'budget',
    titleKey: 'onboardingBudgetTitle',
    subtitleKey: 'onboardingBudgetSubtitle',
    image: BRANDING_ASSETS.onboardingBudget,
  },
  {
    key: 'location',
    titleKey: 'onboardingLocationTitle',
    subtitleKey: 'onboardingLocationSubtitle',
    image: BRANDING_ASSETS.onboardingLocation,
  },
];

export function OnboardingScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  const {t} = useTranslation();
  const {profile, setProfile} = useApp();

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [languageCode, setLanguageCode] = useState(
    localeToLanguageCode(profile.locale),
  );
  const [favorite, setFavorite] = useState('');
  const [budget, setBudget] = useState(
    Number(profile.defaultBudget) > 0
      ? formatBudgetInput(profile.defaultBudget, 'en-US')
      : '',
  );

  const step = stepDefs[index];
  const isLast = index === stepDefs.length - 1;
  const progressText = useMemo(
    () => `${index + 1} / ${stepDefs.length}`,
    [index],
  );

  const handleBudgetChange = (value: string) => {
    // Keep only digits and format thousands immediately as 50,000 / 1,000,000.
    setBudget(formatBudgetInput(value, 'en-US'));
  };

  const revealBudgetInput = () => {
    // Give the native keyboard a moment to resize the window, then move the
    // current input/footer above it. This works on both Android and iOS.
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({animated: true});
    }, 180);
  };

  const selectLanguage = (code: typeof SUPPORTED_LANGUAGES[number]['code']) => {
    const language =
      SUPPORTED_LANGUAGES.find(item => item.code === code) ||
      SUPPORTED_LANGUAGES[0];

    setLanguageCode(language.code);
    void i18n.changeLanguage(language.code);

    // Language is a global app preference, so persist it immediately.
    setProfile({
      ...profile,
      locale: language.locale,
    });
  };

  const finish = async () => {
    const language =
      SUPPORTED_LANGUAGES.find(item => item.code === languageCode) ||
      SUPPORTED_LANGUAGES[0];

    const parsedBudget = parseBudgetInput(budget);

    const nextPreferences = favorite.trim()
      ? Array.from(
          new Set([...(profile.preferences || []), favorite.trim()]),
        )
      : profile.preferences;

    setProfile({
      ...profile,
      locale: language.locale,
      defaultBudget:
        Number.isFinite(parsedBudget) && parsedBudget > 0
          ? parsedBudget
          : profile.defaultBudget,
      preferences: nextPreferences,
    });

    await AsyncStorage.setItem(ONBOARDING_DONE_STORAGE_KEY, '1');
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>TastePilot</Text>
        <Pressable onPress={finish}>
          <Text style={styles.skip}>{t('onboardingSkip')}</Text>
        </Pressable>
      </View>

      <Image
        source={step.image}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.progress}>{progressText}</Text>
      <Text style={styles.title}>{t(step.titleKey)}</Text>
      <Text style={styles.subtitle}>{t(step.subtitleKey)}</Text>

      {step.key === 'welcome' ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t('onboardingLanguageTitle')}</Text>
          <Text style={styles.helper}>{t('onboardingLanguageHint')}</Text>

          <View style={styles.languageGrid}>
            {SUPPORTED_LANGUAGES.map(item => {
              const selected = languageCode === item.code;
              return (
                <Pressable
                  key={item.code}
                  style={[
                    styles.languageChip,
                    selected && styles.languageChipActive,
                  ]}
                  onPress={() => selectLanguage(item.code)}>
                  <Text
                    style={[
                      styles.languageChipText,
                      selected && styles.languageChipTextActive,
                    ]}>
                    {item.nativeName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step.key === 'preferences' ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t('onboardingFavoriteLabel')}</Text>
          <TextInput
            value={favorite}
            onChangeText={setFavorite}
            placeholder={t('onboardingFavoritePlaceholder')}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
        </View>
      ) : null}

      {step.key === 'budget' ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t('onboardingBudgetLabel')}</Text>
          <TextInput
            value={budget}
            onChangeText={handleBudgetChange}
            onFocus={revealBudgetInput}
            placeholder={t('onboardingBudgetPlaceholder')}
            style={styles.input}
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            selectTextOnFocus={false}
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        {index > 0 ? (
          <Pressable
            style={styles.backButton}
            onPress={() => setIndex(value => Math.max(0, value - 1))}>
            <Text style={styles.backText}>{t('onboardingBack')}</Text>
          </Pressable>
        ) : (
          <View style={styles.footerSpacer} />
        )}

        <Pressable
          style={styles.nextButton}
          onPress={
            isLast
              ? finish
              : () =>
                  setIndex(value =>
                    Math.min(stepDefs.length - 1, value + 1),
                  )
          }>
          <Text style={styles.nextText}>
            {isLast ? t('onboardingGetStarted') : t('onboardingNext')}
          </Text>
        </Pressable>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


export default OnboardingScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff9f1',
  },
  container: {
    padding: 20,
    paddingBottom: 72,
    backgroundColor: '#fff9f1',
    flexGrow: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  brand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#d95f38',
  },
  skip: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6b7280',
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 30,
    marginTop: 18,
  },
  progress: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#d95f38',
    marginTop: 20,
  },
  title: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    color: '#171717',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#6b7280',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ece7df',
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#303030',
    marginBottom: 7,
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: '#777',
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e7dfd7',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#171717',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
    marginBottom: 8,
  },
  languageChipActive: {
    backgroundColor: '#d95f38',
    borderColor: '#d95f38',
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555',
  },
  languageChipTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 28,
    alignItems: 'center',
  },
  footerSpacer: {
    flex: 1,
  },
  backButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#444',
  },
  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#d95f38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
});
