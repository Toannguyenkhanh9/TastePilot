import React, {useEffect} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {BRANDING_ASSETS} from '../utils/localArt';
import {ONBOARDING_DONE_STORAGE_KEY} from './OnboardingScreen';

export function SplashScreen({navigation}: NativeStackScreenProps<RootStackParamList, 'Splash'>) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_DONE_STORAGE_KEY);
      navigation.replace(seen ? 'HomeTabs' : 'Onboarding');
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground source={BRANDING_ASSETS.splash} resizeMode="cover" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  image: {flex: 1},
});
