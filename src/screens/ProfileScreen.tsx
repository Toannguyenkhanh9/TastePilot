import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {Chip} from '../components/Chip';
import {PrimaryButton} from '../components/PrimaryButton';
import {useApp} from '../context/AppContext';

const cuisines = ['Asian', 'Italian', 'Mexican', 'Mediterranean', 'American', 'Indian'];
const restrictions = ['Vegetarian', 'Vegan', 'Halal', 'Gluten Free', 'No Pork', 'No Beef'];

export function ProfileScreen() {
  const {profile, setProfile} = useApp();
  const [currency, setCurrency] = useState(profile.currency);
  const [locale, setLocale] = useState(profile.locale);
  const [budget, setBudget] = useState(String(profile.defaultBudget));
  const [prefs, setPrefs] = useState(profile.preferences);
  const [rules, setRules] = useState(profile.restrictions);
  const [autoCurrency, setAutoCurrency] = useState(profile.autoCurrency !== false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);
  };

  const save = () => {
    const amount = Number(budget.replace(',', '.'));
    if (!amount || amount <= 0) return Alert.alert('Budget', 'Enter a valid default budget.');
    setProfile({
      currency: currency.trim().toUpperCase() || 'USD',
      locale: locale.trim() || 'en-US',
      defaultBudget: amount,
      preferences: prefs,
      restrictions: rules,
      autoCurrency,
    });
    Alert.alert('Saved', 'Your food profile has been updated.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Food Profile</Text>
      <Text style={styles.subtitle}>Used by both Daily Meal and Travel Food.</Text>

      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <Text style={styles.switchTitle}>Use local currency automatically</Text>
          <Text style={styles.switchText}>TastePilot can use the currency of your current area or travel destination.</Text>
        </View>
        <Switch value={autoCurrency} onValueChange={setAutoCurrency} />
      </View>

      <Text style={styles.label}>Fallback currency code</Text>
      <TextInput style={styles.input} value={currency} onChangeText={setCurrency} autoCapitalize="characters" placeholder="USD" />
      <Text style={styles.label}>Locale</Text>
      <TextInput style={styles.input} value={locale} onChangeText={setLocale} placeholder="en-US" />
      <Text style={styles.label}>Typical meal budget</Text>
      <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />

      <Text style={styles.label}>Food you enjoy</Text>
      <View style={styles.chips}>{cuisines.map(x => <Chip key={x} label={x} selected={prefs.includes(x)} onPress={() => toggle(prefs, setPrefs, x)} />)}</View>

      <Text style={styles.label}>Dietary restrictions</Text>
      <View style={styles.chips}>{restrictions.map(x => <Chip key={x} label={x} selected={rules.includes(x)} onPress={() => toggle(rules, setRules, x)} />)}</View>

      <View style={{height: 12}} />
      <PrimaryButton title="Save profile" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 40, backgroundColor: '#fff'},
  title: {fontSize: 28, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 14, color: '#777', marginTop: 8},
  switchRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f8fd', borderRadius: 18, padding: 16, marginTop: 22},
  switchCopy: {flex: 1, paddingRight: 14},
  switchTitle: {fontSize: 15, fontWeight: '900', color: '#1b2430'},
  switchText: {fontSize: 12, lineHeight: 18, color: '#68758a', marginTop: 5},
  label: {fontSize: 14, fontWeight: '800', color: '#333', marginTop: 22, marginBottom: 9},
  input: {height: 54, borderRadius: 15, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 15, fontSize: 16, color: '#171717'},
  chips: {flexDirection: 'row', flexWrap: 'wrap'},
});
