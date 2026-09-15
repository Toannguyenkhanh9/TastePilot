import React, {useMemo, useState} from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Chip} from '../components/Chip';
import {PrimaryButton} from '../components/PrimaryButton';
import {useApp} from '../context/AppContext';
import {APP_LOCAL_BANNERS} from '../utils/localArt';
import {LocalBanner} from '../components/LocalBanner';
import {SUPPORTED_LANGUAGES, localeToLanguageCode} from '../i18n';

const cuisineDefs = [
  {id: 'Asian', key: 'profile.cuisines.asian'},
  {id: 'Italian', key: 'profile.cuisines.italian'},
  {id: 'Mexican', key: 'profile.cuisines.mexican'},
  {id: 'Mediterranean', key: 'profile.cuisines.mediterranean'},
  {id: 'American', key: 'profile.cuisines.american'},
  {id: 'Indian', key: 'profile.cuisines.indian'},
];

const restrictionDefs = [
  {id: 'Vegetarian', key: 'profile.restrictionsList.vegetarian'},
  {id: 'Vegan', key: 'profile.restrictionsList.vegan'},
  {id: 'Halal', key: 'profile.restrictionsList.halal'},
  {id: 'Gluten Free', key: 'profile.restrictionsList.glutenFree'},
  {id: 'No Pork', key: 'profile.restrictionsList.noPork'},
  {id: 'No Beef', key: 'profile.restrictionsList.noBeef'},
];

export function ProfileScreen() {
  const {t} = useTranslation();
  const {profile, setProfile} = useApp();
  const [currency, setCurrency] = useState(profile.currency);
  const [languageCode, setLanguageCode] = useState(localeToLanguageCode(profile.locale));
  const [budget, setBudget] = useState(String(profile.defaultBudget));
  const [prefs, setPrefs] = useState(profile.preferences);
  const [rules, setRules] = useState(profile.restrictions);

  const selectedLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find(item => item.code === languageCode) || SUPPORTED_LANGUAGES[0],
    [languageCode],
  );

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);

  const save = () => {
    const amount = Number(String(budget).replace(/,/g, ''));
    if (!amount || amount <= 0) {
      return Alert.alert(t('profile.invalidBudgetTitle'), t('profile.invalidBudgetText'));
    }

    setProfile({
      ...profile,
      currency: currency.trim().toUpperCase() || 'USD',
      locale: selectedLanguage.locale,
      defaultBudget: amount,
      preferences: prefs,
      restrictions: rules,
    });
    Alert.alert(t('profile.savedTitle'), t('profile.savedText'));
  };

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.home} style={styles.screen} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={84}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <LocalBanner
            imageSource={APP_LOCAL_BANNERS.home}
            eyebrow={t('profile.heroEyebrow')}
            title={t('profile.heroTitle')}
            subtitle={t('profile.heroSubtitle')}
            height={198}
          />

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>{t('profile.languageTitle')}</Text>
            <Text style={styles.helper}>{t('profile.languageHint')}</Text>
            <View style={styles.languageGrid}>
              {SUPPORTED_LANGUAGES.map(item => (
                <Pressable
                  key={item.code}
                  style={[styles.languageChip, languageCode === item.code && styles.languageChipActive]}
                  onPress={() => setLanguageCode(item.code)}>
                  <Text style={[styles.languageChipText, languageCode === item.code && styles.languageChipTextActive]}>
                    {item.nativeName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>{t('profile.basics')}</Text>
            <Text style={styles.label}>{t('profile.currencyCode')}</Text>
            <TextInput style={styles.input} value={currency} onChangeText={setCurrency} autoCapitalize="characters" placeholder="USD" placeholderTextColor="#aaa" />
            <Text style={styles.label}>{t('profile.locale')}</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{selectedLanguage.locale}</Text>
            </View>
            <Text style={styles.label}>{t('profile.typicalBudget')}</Text>
            <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="number-pad" placeholder="20" placeholderTextColor="#aaa" />
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>{t('profile.foodEnjoy')}</Text>
            <View style={styles.chips}>
              {cuisineDefs.map(item => (
                <Chip key={item.id} label={t(item.key)} selected={prefs.includes(item.id)} onPress={() => toggle(prefs, setPrefs, item.id)} />
              ))}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>{t('profile.dietaryRestrictions')}</Text>
            <View style={styles.chips}>
              {restrictionDefs.map(item => (
                <Chip key={item.id} label={t(item.key)} selected={rules.includes(item.id)} onPress={() => toggle(rules, setRules, item.id)} />
              ))}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('profile.tipTitle')}</Text>
            <Text style={styles.infoText}>{t('profile.tipText')}</Text>
          </View>

          <PrimaryButton title={t('profile.save')} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#f7f1e9'},
  bgImage: {opacity: 0.18},
  overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(250,247,243,0.88)'},
  flex: {flex: 1},
  container: {padding: 20, paddingBottom: 40},
  panel: {backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#eadfce', marginBottom: 14},
  sectionTitle: {fontSize: 16, fontWeight: '900', color: '#171717'},
  helper: {fontSize: 13, lineHeight: 20, color: '#666', marginTop: 6},
  label: {fontSize: 14, fontWeight: '800', color: '#333', marginTop: 18, marginBottom: 9},
  input: {height: 54, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', paddingHorizontal: 15, fontSize: 16, color: '#171717'},
  readonlyBox: {height: 54, borderRadius: 16, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#f7f7f7', paddingHorizontal: 15, justifyContent: 'center'},
  readonlyText: {fontSize: 16, color: '#666'},
  chips: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 12},
  languageGrid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 12},
  languageChip: {paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f2f2f2', marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: 'transparent'},
  languageChipActive: {backgroundColor: '#1d2735', borderColor: '#1d2735'},
  languageChipText: {fontSize: 12, fontWeight: '800', color: '#555'},
  languageChipTextActive: {color: '#fff'},
  infoCard: {backgroundColor: '#fff2df', borderRadius: 20, padding: 16, marginBottom: 20},
  infoTitle: {fontSize: 15, fontWeight: '900', color: '#171717'},
  infoText: {fontSize: 13, lineHeight: 20, color: '#666', marginTop: 6},
});
