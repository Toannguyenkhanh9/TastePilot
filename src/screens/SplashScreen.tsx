import React, {useEffect} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {BRANDING_ASSETS} from '../utils/localArt';
import {ONBOARDING_DONE_STORAGE_KEY} from '../constants/onboarding';
import {useApp} from '../context/AppContext';

export function SplashScreen({navigation}: NativeStackScreenProps<RootStackParamList, 'Splash'>) {
  const {hydrated} = useApp();

  useEffect(() => {
    if (!hydrated) return;

    let active = true;
    const timer = setTimeout(async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_DONE_STORAGE_KEY);
      if (!active) return;
      navigation.replace(seen ? 'MainTabs' : 'Onboarding');
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [hydrated, navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground source={BRANDING_ASSETS.splash} resizeMode="cover" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff9f1'},
  image: {flex: 1},
});
