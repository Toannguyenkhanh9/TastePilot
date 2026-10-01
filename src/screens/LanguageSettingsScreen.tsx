import React, {useRef, useState} from 'react';
import {
  ImageBackground,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useApp} from '../context/AppContext';
import {SUPPORTED_LANGUAGES} from '../i18n';
import {APP_LOCAL_BANNERS} from '../utils/localArt';
import {LocalBanner} from '../components/LocalBanner';

function languageFromLocale(locale?: string) {
  const value = String(locale || '').toLowerCase();
  return SUPPORTED_LANGUAGES.find(item => value.startsWith(item.code)) || SUPPORTED_LANGUAGES[0];
}

export function LanguageSettingsScreen() {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const {profile, setProfile} = useApp();
  const current = languageFromLocale(profile.locale);
  const [changing, setChanging] = useState(false);
  const pendingRef = useRef(false);

  const chooseLanguage = (item: typeof SUPPORTED_LANGUAGES[number]) => {
    if (pendingRef.current || item.code === current.code) {
      return;
    }

    pendingRef.current = true;
    setChanging(true);

    // IMPORTANT:
    // Pop the native-stack screen first. Only change i18n/profile after the
    // Android native-stack transition has completely finished. This avoids
    // ScreenStackHeaderConfig being updated while its fragment is detaching.
    navigation.goBack();

    InteractionManager.runAfterInteractions(() => {
      setProfile({...profile, locale: item.locale});
      // AppContext observes profile.locale and calls i18n.changeLanguage().
      // Do not call i18n.changeLanguage() a second time here.
      pendingRef.current = false;
    });
  };

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.home} style={styles.screen} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />

      <View style={styles.customHeader}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} disabled={changing}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('navLanguage')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <LocalBanner
          imageSource={APP_LOCAL_BANNERS.travel}
          eyebrow={t('profileLanguageTitle').toUpperCase()}
          title={t('languageTitle')}
          subtitle={t('languageSubtitle')}
          height={158}
        />

        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>{t('languageCurrent')}</Text>
          <Text style={styles.currentValue}>{current.label}</Text>
        </View>

        <View style={styles.listCard}>
          {SUPPORTED_LANGUAGES.map((item, index) => {
            const active = item.code === current.code;
            return (
              <Pressable
                key={item.code}
                disabled={changing}
                style={[
                  styles.row,
                  index < SUPPORTED_LANGUAGES.length - 1 && styles.rowBorder,
                  active && styles.rowActive,
                  changing && styles.rowDisabled,
                ]}
                onPress={() => chooseLanguage(item)}>
                <View style={styles.rowCopy}>
                  <Text style={[styles.languageName, active && styles.languageNameActive]}>{item.label}</Text>
                  <Text style={styles.localeText}>{item.locale}</Text>
                </View>
                <Text style={[styles.check, active && styles.checkActive]}>{active ? '✓' : '›'}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff9f1'},
  bgImage: {opacity: 0.28},
  overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,248,238,0.82)'},
  customHeader: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ece6df',
  },
  backButton: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  backIcon: {fontSize: 38, lineHeight: 40, color: '#171717', marginTop: -2},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#171717'},
  headerSpacer: {width: 48},
  container: {padding: 20, paddingBottom: 40},
  currentCard: {backgroundColor: '#fff2df', borderRadius: 20, padding: 16, marginBottom: 14},
  currentLabel: {fontSize: 12, fontWeight: '900', color: '#9a6a2a', letterSpacing: 0.5},
  currentValue: {fontSize: 20, fontWeight: '900', color: '#171717', marginTop: 5},
  listCard: {backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 22, borderWidth: 1, borderColor: '#eadfce', overflow: 'hidden'},
  row: {minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16},
  rowBorder: {borderBottomWidth: 1, borderBottomColor: '#eee8e0'},
  rowActive: {backgroundColor: '#fff3ed'},
  rowDisabled: {opacity: 0.7},
  rowCopy: {flex: 1},
  languageName: {fontSize: 16, fontWeight: '800', color: '#222'},
  languageNameActive: {color: '#c5522f'},
  localeText: {fontSize: 12, color: '#8a8a8a', marginTop: 4},
  check: {fontSize: 24, color: '#b0a69a'},
  checkActive: {fontSize: 20, fontWeight: '900', color: '#c5522f'},
});
