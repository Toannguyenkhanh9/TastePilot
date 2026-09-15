import React from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useApp} from '../context/AppContext';
import {LocationSummary} from '../components/LocationSummary';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {APP_LOCAL_BANNERS} from '../utils/localArt';

const sampleDailyMeal = {
  id: 'sample-daily',
  name: 'Pho',
  cuisine: 'Vietnamese',
  estimatedMin: 0,
  estimatedMax: 0,
  reason: '',
  localSpecialty: true,
};

const sampleTravelMeal = {
  id: 'sample-travel',
  name: 'Sushi',
  cuisine: 'Japanese',
  estimatedMin: 0,
  estimatedMax: 0,
  reason: '',
  localSpecialty: true,
};

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const {locationContext} = useApp();

  return (
    <ImageBackground
      source={APP_LOCAL_BANNERS.home}
      style={styles.screen}
      imageStyle={styles.backgroundImage}>
      <View style={styles.backgroundOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>{t('home.brand')}</Text>

        <View style={styles.introCard}>
          <Text style={styles.kicker}>{t('home.kicker')}</Text>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.section}>
          <LocationSummary value={locationContext || null} title={t('home.lastDetectedArea')} />
        </View>

        <Pressable style={styles.entryCard} onPress={() => navigation.navigate('DailyMeal')}>
          <View style={styles.iconBox}>
            <FoodAssetIcon meal={sampleDailyMeal as any} size={58} />
          </View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.entryTitle}>{t('home.dailyCardTitle')}</Text>
              <View style={styles.smallPill}><Text style={styles.smallPillText}>{t('home.dailyCardBadge')}</Text></View>
            </View>
            <Text style={styles.entryText}>{t('home.dailyCardText')}</Text>
          </View>
          <Text style={styles.entryArrow}>→</Text>
        </Pressable>

        <Pressable style={styles.entryCard} onPress={() => navigation.navigate('TravelFood')}>
          <View style={styles.iconBox}>
            <FoodAssetIcon meal={sampleTravelMeal as any} size={58} />
          </View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.entryTitle}>{t('home.travelCardTitle')}</Text>
              <View style={styles.smallPillAlt}><Text style={styles.smallPillTextAlt}>{t('home.travelCardBadge')}</Text></View>
            </View>
            <Text style={styles.entryText}>{t('home.travelCardText')}</Text>
          </View>
          <Text style={styles.entryArrow}>→</Text>
        </Pressable>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f2ea',
  },
  backgroundImage: {
    opacity: 0.24,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 244, 237, 0.86)',
  },
  container: {
    padding: 20,
    paddingBottom: 34,
  },
  brand: {
    fontSize: 17,
    fontWeight: '900',
    color: '#325ea8',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  introCard: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: '#eadfce',
    borderRadius: 28,
    padding: 22,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#8a6949',
  },
  title: {
    marginTop: 10,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    color: '#171717',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#5d5d5d',
  },
  section: {
    marginTop: 18,
  },
  entryCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ebdfcf',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  iconBox: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#fff5e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  entryCopy: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '900',
    color: '#171717',
    paddingRight: 8,
  },
  smallPill: {
    backgroundColor: '#eef4ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#325ea8',
  },
  smallPillAlt: {
    backgroundColor: '#fff1df',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallPillTextAlt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#a86821',
  },
  entryText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },
  entryArrow: {
    marginLeft: 12,
    fontSize: 28,
    fontWeight: '900',
    color: '#999',
  },
});
