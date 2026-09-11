import React, {useEffect, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {PrimaryButton} from '../components/PrimaryButton';
import {LocationSummary} from '../components/LocationSummary';
import {getCurrentLocation} from '../services/locationService';
import {resolveCurrentLocation, resolveDestination} from '../services/placeService';
import {getTravelRecommendations} from '../services/recommendationService';
import {LocationContext} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelFood'>;

export function TravelFoodScreen({navigation}: Props) {
  const {profile, locationContext, setLocationContext} = useApp();
  const [budget, setBudget] = useState(String(profile.defaultBudget));
  const [destination, setDestination] = useState('');
  const [useCurrent, setUseCurrent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [currentContext, setCurrentContext] = useState<LocationContext | null>(
    locationContext?.source === 'current' ? locationContext : null,
  );
  const [destinationContext, setDestinationContext] = useState<LocationContext | null>(null);

  const activeContext = useCurrent ? currentContext : destinationContext;
  const activeCurrency = profile.autoCurrency !== false
    ? activeContext?.currency || profile.currency
    : profile.currency;

  const detectCurrent = async () => {
    setDetecting(true);
    try {
      const coordinates = await getCurrentLocation();
      const resolved = await resolveCurrentLocation(coordinates, profile.currency);
      if (profile.autoCurrency !== false && resolved.currency !== profile.currency && budget === String(profile.defaultBudget)) {
        setBudget('');
      }
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

  const switchMode = (current: boolean) => {
    setUseCurrent(current);
    if (!current) {
      setDestinationContext(null);
      if (profile.autoCurrency !== false) setBudget('');
    } else if (currentContext && profile.autoCurrency !== false && currentContext.currency !== profile.currency) {
      setBudget('');
    } else if (!budget) {
      setBudget(String(profile.defaultBudget));
    }
  };

  const checkDestination = async () => {
    const value = destination.trim();
    if (!value) return Alert.alert('Destination', 'Enter a city or area.');
    setDetecting(true);
    try {
      const resolved = await resolveDestination(value, profile.currency);
      setDestinationContext(resolved);
      if (profile.autoCurrency !== false && resolved.currency !== profile.currency) setBudget('');
      return resolved;
    } catch (e) {
      Alert.alert('Could not find destination', e instanceof Error ? e.message : 'Unknown error');
      return undefined;
    } finally {
      setDetecting(false);
    }
  };

  const submit = async () => {
    if (!useCurrent && !destination.trim()) return Alert.alert('Destination', 'Enter a city or area.');

    setLoading(true);
    try {
      let resolved = activeContext;
      if (useCurrent && !resolved) resolved = await detectCurrent();
      if (!useCurrent && !resolved) {
        const found = await resolveDestination(destination.trim(), profile.currency);
        setDestinationContext(found);
        resolved = found;
      }

      const currency = profile.autoCurrency !== false
        ? resolved?.currency || profile.currency
        : profile.currency;
      const amount = Number(budget.replace(',', '.'));

      if (!amount || amount <= 0) {
        Alert.alert('Budget', `Enter your meal budget in ${currency}.`);
        return;
      }

      const destinationLabel = useCurrent ? undefined : destination.trim();
      const suggestions = await getTravelRecommendations({
        budget: amount,
        destination: destinationLabel,
        location: resolved?.coordinates,
        locationContext: resolved || undefined,
        profile: {...profile, currency},
      });

      const resolvedTitle = [resolved?.city, resolved?.country].filter(Boolean).join(', ');
      navigation.navigate('MealResults', {
        mode: 'travel',
        title: useCurrent
          ? (resolvedTitle ? `Must-try food in ${resolvedTitle}` : 'Local must-try food')
          : `Try in ${resolvedTitle || destination.trim()}`,
        suggestions,
        destination: destinationLabel,
        currency,
        locale: profile.locale,
        locationContext: resolved || undefined,
      });
    } catch (e) {
      Alert.alert('Could not explore this area', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Explore Local Food</Text>
      <Text style={styles.subtitle}>Discover signature dishes and highly rated places around where you are—or where you are going next.</Text>

      <View style={styles.segment}>
        <Pressable style={[styles.segmentItem, useCurrent && styles.segmentActive]} onPress={() => switchMode(true)}>
          <Text style={[styles.segmentText, useCurrent && styles.segmentTextActive]}>Current location</Text>
        </Pressable>
        <Pressable style={[styles.segmentItem, !useCurrent && styles.segmentActive]} onPress={() => switchMode(false)}>
          <Text style={[styles.segmentText, !useCurrent && styles.segmentTextActive]}>Search destination</Text>
        </Pressable>
      </View>

      {useCurrent ? (
        <LocationSummary value={currentContext} loading={detecting} onRefresh={() => detectCurrent().catch(() => undefined)} title="You are exploring" />
      ) : (
        <>
          <Text style={styles.label}>City or area</Text>
          <View style={styles.destinationRow}>
            <TextInput
              style={[styles.input, styles.destinationInput]}
              value={destination}
              onChangeText={value => {
                setDestination(value);
                setDestinationContext(null);
              }}
              placeholder="Osaka, Japan"
              placeholderTextColor="#aaa"
            />
            <Pressable style={styles.checkButton} onPress={() => checkDestination()} disabled={detecting}>
              <Text style={styles.checkButtonText}>{detecting ? '…' : 'Check'}</Text>
            </Pressable>
          </View>
          {destinationContext ? <LocationSummary value={destinationContext} title="Destination" /> : null}
        </>
      )}

      <Text style={styles.label}>Meal budget ({activeCurrency})</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        keyboardType="decimal-pad"
        placeholder={`Enter ${activeCurrency} budget`}
        placeholderTextColor="#aaa"
      />
      {!useCurrent && !destinationContext && profile.autoCurrency !== false ? (
        <Text style={styles.currencyHint}>Check the destination first so TastePilot can use its local currency.</Text>
      ) : null}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Travel ranking</Text>
        <Text style={styles.infoText}>Local specialty + restaurant rating + review confidence + distance + budget + your dietary restrictions.</Text>
      </View>

      <PrimaryButton title="Explore food" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 36, backgroundColor: '#fff', flexGrow: 1},
  title: {fontSize: 30, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 15, lineHeight: 22, color: '#707070', marginTop: 8},
  segment: {flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 14, padding: 4, marginTop: 24},
  segmentItem: {flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: 'center'},
  segmentActive: {backgroundColor: '#fff'},
  segmentText: {fontWeight: '700', color: '#777', fontSize: 13},
  segmentTextActive: {color: '#171717'},
  label: {fontSize: 14, fontWeight: '800', color: '#303030', marginTop: 24, marginBottom: 10},
  destinationRow: {flexDirection: 'row', gap: 10},
  destinationInput: {flex: 1},
  input: {height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#dedede', paddingHorizontal: 16, fontSize: 17, color: '#171717'},
  checkButton: {height: 56, minWidth: 74, borderRadius: 16, backgroundColor: '#1d2735', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14},
  checkButtonText: {fontSize: 13, fontWeight: '900', color: '#fff'},
  currencyHint: {fontSize: 12, lineHeight: 18, color: '#6c7890', marginTop: 8},
  info: {backgroundColor: '#fff7e8', borderRadius: 18, padding: 16, marginVertical: 24},
  infoTitle: {fontSize: 15, fontWeight: '800', color: '#553b09'},
  infoText: {fontSize: 13, color: '#715a2c', lineHeight: 20, marginTop: 6},
});
