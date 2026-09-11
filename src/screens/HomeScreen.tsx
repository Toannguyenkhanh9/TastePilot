import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {ModeCard} from '../components/ModeCard';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {t} = useTranslation();
  const {locationContext} = useApp();
  const lastPlace = [locationContext?.city, locationContext?.country].filter(Boolean).join(', ');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>TastePilot</Text>
      <Text style={styles.headline}>{t('homeTitle')}</Text>
      <Text style={styles.lead}>Smart meal ideas for everyday life and your next trip.</Text>

      {locationContext ? (
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationCopy}>
            <Text style={styles.locationLabel}>LAST DETECTED AREA</Text>
            <Text style={styles.locationText}>{lastPlace || locationContext.formattedAddress || 'Current area'}</Text>
            <Text style={styles.locationMeta}>Local currency · {locationContext.currency}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.cards}>
        <ModeCard emoji="🍽️" title={t('dailyTitle')} subtitle={t('dailySubtitle')} onPress={() => navigation.navigate('DailyMeal')} />
        <ModeCard emoji="✈️" title={t('travelTitle')} subtitle={t('travelSubtitle')} onPress={() => navigation.navigate('TravelFood')} />
      </View>
      <View style={styles.tip}>
        <Text style={styles.tipTitle}>One profile, two modes</Text>
        <Text style={styles.tipText}>Daily Meal learns from your history. Travel Food prioritizes local specialties and highly rated places around your destination.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 40, backgroundColor: '#fafafa', flexGrow: 1},
  brand: {fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginTop: 8, color: '#2457a7'},
  headline: {fontSize: 32, lineHeight: 38, fontWeight: '900', color: '#151515', marginTop: 18},
  lead: {fontSize: 16, lineHeight: 23, color: '#717171', marginTop: 8, maxWidth: 330},
  locationCard: {flexDirection: 'row', backgroundColor: '#f2f7ff', borderRadius: 18, padding: 14, marginTop: 20, borderWidth: 1, borderColor: '#e0eaf8'},
  locationIcon: {fontSize: 21, marginTop: 3},
  locationCopy: {flex: 1, marginLeft: 11},
  locationLabel: {fontSize: 10, fontWeight: '900', letterSpacing: 0.8, color: '#6b7890'},
  locationText: {fontSize: 15, fontWeight: '900', color: '#1b2430', marginTop: 3},
  locationMeta: {fontSize: 12, color: '#6b7890', marginTop: 3},
  cards: {marginTop: 28},
  tip: {marginTop: 12, backgroundColor: '#eef7ef', borderRadius: 20, padding: 18},
  tipTitle: {fontSize: 16, fontWeight: '800', color: '#1d3b22'},
  tipText: {fontSize: 14, lineHeight: 21, color: '#48614c', marginTop: 8},
});
