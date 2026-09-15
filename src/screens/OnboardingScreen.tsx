import React, {useMemo, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {BRANDING_ASSETS} from '../utils/localArt';

const STORAGE_KEY = 'tastepilot:onboarding_done';

type Step = {key: string; title: string; subtitle: string; image: any};
const steps: Step[] = [
  {key: 'welcome', title: 'Welcome to TastePilot', subtitle: 'Discover meals that fit your budget and your mood.', image: BRANDING_ASSETS.onboardingWelcome},
  {key: 'preferences', title: 'Personalize your taste', subtitle: 'Set a few preferences so the app can suggest better dishes.', image: BRANDING_ASSETS.onboardingPreferences},
  {key: 'budget', title: 'Budget-first suggestions', subtitle: 'Enter a realistic budget and TastePilot will keep picks practical.', image: BRANDING_ASSETS.onboardingBudget},
  {key: 'location', title: 'Nearby places, faster', subtitle: 'Use location to find restaurants around you or around your travel destination.', image: BRANDING_ASSETS.onboardingLocation},
];

export function OnboardingScreen({navigation}: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  const [index, setIndex] = useState(0);
  const [favorite, setFavorite] = useState('');
  const [budget, setBudget] = useState('');
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const progressText = useMemo(() => `${index + 1} / ${steps.length}`, [index]);

  const finish = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
    navigation.replace('HomeTabs');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>TastePilot</Text>
        <Pressable onPress={finish}><Text style={styles.skip}>Skip</Text></Pressable>
      </View>

      <Image source={step.image} style={styles.image} resizeMode="cover" />
      <Text style={styles.progress}>{progressText}</Text>
      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.subtitle}>{step.subtitle}</Text>

      {step.key === 'preferences' ? (
        <View style={styles.card}>
          <Text style={styles.label}>Favorite dish or cuisine</Text>
          <TextInput value={favorite} onChangeText={setFavorite} placeholder="Pho, sushi, grilled food..." style={styles.input} placeholderTextColor="#aaa" />
        </View>
      ) : null}

      {step.key === 'budget' ? (
        <View style={styles.card}>
          <Text style={styles.label}>Typical meal budget</Text>
          <TextInput value={budget} onChangeText={setBudget} placeholder="e.g. 50,000 VND or 10 USD" style={styles.input} placeholderTextColor="#aaa" />
        </View>
      ) : null}

      <View style={styles.footer}>
        {index > 0 ? <Pressable style={styles.backButton} onPress={() => setIndex(x => Math.max(0, x - 1))}><Text style={styles.backText}>Back</Text></Pressable> : <View style={{flex: 1}} />}
        <Pressable style={styles.nextButton} onPress={isLast ? finish : () => setIndex(x => Math.min(steps.length - 1, x + 1))}>
          <Text style={styles.nextText}>{isLast ? 'Get started' : 'Next'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export {STORAGE_KEY as ONBOARDING_DONE_STORAGE_KEY};

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 36, backgroundColor: '#fbfaf8', flexGrow: 1},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
  brand: {fontSize: 16, fontWeight: '900', color: '#2457a7'},
  skip: {fontSize: 14, fontWeight: '800', color: '#6b7280'},
  image: {width: '100%', height: 320, borderRadius: 30, marginTop: 18},
  progress: {fontSize: 12, fontWeight: '900', letterSpacing: 1, color: '#2457a7', marginTop: 20},
  title: {fontSize: 32, lineHeight: 38, fontWeight: '900', color: '#171717', marginTop: 10},
  subtitle: {fontSize: 16, lineHeight: 24, color: '#6b7280', marginTop: 10},
  card: {backgroundColor: '#fff', borderRadius: 22, padding: 16, marginTop: 22, borderWidth: 1, borderColor: '#ece7df'},
  label: {fontSize: 14, fontWeight: '800', color: '#303030', marginBottom: 8},
  input: {height: 54, borderRadius: 16, borderWidth: 1, borderColor: '#e7dfd7', paddingHorizontal: 14, fontSize: 15, color: '#171717'},
  footer: {flexDirection: 'row', marginTop: 28, alignItems: 'center'},
  backButton: {flex: 1, height: 52, borderRadius: 16, backgroundColor: '#f3f3f3', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  backText: {fontSize: 14, fontWeight: '800', color: '#444'},
  nextButton: {flex: 1, height: 52, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center'},
  nextText: {fontSize: 14, fontWeight: '900', color: '#fff'},
});
