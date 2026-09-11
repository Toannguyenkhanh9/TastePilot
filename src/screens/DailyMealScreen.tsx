import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {Chip} from '../components/Chip';
import {PrimaryButton} from '../components/PrimaryButton';
import {LocationSummary} from '../components/LocationSummary';
import {getCurrentLocation} from '../services/locationService';
import {resolveCurrentLocation} from '../services/placeService';
import {getDailyRecommendations} from '../services/recommendationService';
import {LocationContext} from '../types';

const options = ['Healthy', 'High Protein', 'Vegetarian', 'Quick Meal', 'Something New'];

type Props = NativeStackScreenProps<RootStackParamList, 'DailyMeal'>;

export function DailyMealScreen({navigation}: Props) {
  const {profile, history, locationContext, setLocationContext} = useApp();
  const [budget, setBudget] = useState(String(profile.defaultBudget));
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [activeLocation, setActiveLocation] = useState<LocationContext | null>(
    locationContext?.source === 'current' ? locationContext : null,
  );

  const activeCurrency = profile.autoCurrency !== false
    ? activeLocation?.currency || profile.currency
    : profile.currency;

  const toggle = (value: string) => {
    setSelected(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  };

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const coordinates = await getCurrentLocation();
      const resolved = await resolveCurrentLocation(coordinates, profile.currency);
      if (profile.autoCurrency !== false && resolved.currency !== activeCurrency && budget === String(profile.defaultBudget)) {
        setBudget('');
      }
      setActiveLocation(resolved);
      setLocationContext(resolved);
      return resolved;
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    detectLocation().catch(() => undefined);
    // Intentionally detect once when entering the foreground screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    const amount = Number(budget.replace(',', '.'));
    if (!amount || amount <= 0) return Alert.alert('Budget', `Please enter a valid budget in ${activeCurrency}.`);

    setLoading(true);
    try {
      let resolved = activeLocation;
      if (!resolved) {
        try { resolved = await detectLocation(); } catch { resolved = null; }
      }

      const requestCurrency = profile.autoCurrency !== false
        ? resolved?.currency || profile.currency
        : profile.currency;

      const suggestions = await getDailyRecommendations({
        budget: amount,
        preferences: selected,
        location: resolved?.coordinates,
        locationContext: resolved || undefined,
        history,
        profile: {...profile, currency: requestCurrency},
      });

      navigation.navigate('MealResults', {
        mode: 'daily',
        title: "Today's picks",
        suggestions,
        currency: requestCurrency,
        locale: profile.locale,
        locationContext: resolved || undefined,
      });
    } catch (e) {
      Alert.alert('Could not load suggestions', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>What should I eat today?</Text>
      <Text style={styles.subtitle}>We avoid recent meals and prioritize options that fit your budget, preferences, and nearby availability.</Text>

      <LocationSummary value={activeLocation} loading={detecting} onRefresh={() => detectLocation().catch(() => undefined)} />

      <Text style={styles.label}>Budget ({activeCurrency})</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        keyboardType="decimal-pad"
        placeholder={activeCurrency === profile.currency ? String(profile.defaultBudget) : `Enter ${activeCurrency} budget`}
        placeholderTextColor="#aaa"
      />
      {profile.autoCurrency !== false && activeLocation?.currency && activeLocation.currency !== profile.currency ? (
        <Text style={styles.currencyHint}>TastePilot detected the local currency as {activeLocation.currency}. Enter a budget in local currency.</Text>
      ) : null}

      <Text style={styles.label}>Optional preferences</Text>
      <View style={styles.chips}>{options.map(x => <Chip key={x} label={x} selected={selected.includes(x)} onPress={() => toggle(x)} />)}</View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Personalized automatically</Text>
        <Text style={styles.infoText}>Recent meal history, your saved preferences, local area and nearby availability are used to reduce repetition.</Text>
      </View>

      <PrimaryButton title="Find my meal" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 36, backgroundColor: '#fff', flexGrow: 1},
  title: {fontSize: 30, lineHeight: 36, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 15, lineHeight: 22, color: '#707070', marginTop: 8},
  label: {fontSize: 14, fontWeight: '800', color: '#303030', marginTop: 26, marginBottom: 10},
  input: {height: 58, borderRadius: 16, borderWidth: 1, borderColor: '#dedede', paddingHorizontal: 16, fontSize: 21, fontWeight: '800', color: '#171717'},
  currencyHint: {fontSize: 12, lineHeight: 18, color: '#6c7890', marginTop: 8},
  chips: {flexDirection: 'row', flexWrap: 'wrap'},
  info: {backgroundColor: '#f7f7f7', borderRadius: 18, padding: 16, marginVertical: 24},
  infoTitle: {fontSize: 15, fontWeight: '800', color: '#222'},
  infoText: {fontSize: 13, color: '#707070', lineHeight: 20, marginTop: 6},
});
