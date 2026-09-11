import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {formatMoney} from '../utils/format';
import {resolveApiImageUrl} from '../services/imageUrl';

export function MealResultsScreen({route, navigation}: NativeStackScreenProps<RootStackParamList, 'MealResults'>) {
  const {suggestions, title, mode, destination, currency, locale, locationContext} = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>{mode === 'travel' ? 'EXPLORE LOCAL' : 'DAILY MEAL'}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Pick one and TastePilot will find highly rated places that match it.</Text>

      {suggestions.map(meal => (
        <Pressable
          key={meal.id}
          style={styles.card}
          onPress={() => navigation.navigate('Restaurants', {meal, mode, destination, locationContext})}>
          {meal.imageUrl ? (
            <View>
              <Image source={{uri: resolveApiImageUrl(meal.imageUrl)}} style={styles.image} />
              {meal.representativeImage ? <Text style={styles.photoNote}>Representative nearby place photo</Text> : null}
            </View>
          ) : <View style={styles.placeholder}><Text style={styles.placeholderEmoji}>🍽️</Text></View>}
          <View style={styles.body}>
            <View style={styles.row}>
              <Text style={styles.mealName}>{meal.name}</Text>
              {meal.localSpecialty && <Text style={styles.badge}>LOCAL</Text>}
            </View>
            <Text style={styles.meta}>{meal.cuisine} · {formatMoney(meal.estimatedMin, locale, currency)}–{formatMoney(meal.estimatedMax, locale, currency)}</Text>
            <Text style={styles.reason}>{meal.reason}</Text>
            <Text style={styles.cta}>Find places →</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 40, backgroundColor: '#fafafa'},
  eyebrow: {fontSize: 12, fontWeight: '900', letterSpacing: 1.4, color: '#777'},
  title: {fontSize: 30, fontWeight: '900', color: '#171717', marginTop: 8},
  subtitle: {fontSize: 14, color: '#777', lineHeight: 21, marginTop: 7, marginBottom: 20},
  card: {backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', marginBottom: 18, borderWidth: 1, borderColor: '#ebebeb'},
  image: {width: '100%', height: 180, backgroundColor: '#eee'},
  photoNote: {position: 'absolute', right: 8, bottom: 8, fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: 'rgba(0,0,0,0.58)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999},
  placeholder: {width: '100%', height: 180, backgroundColor: '#edf3fb', alignItems: 'center', justifyContent: 'center'},
  placeholderEmoji: {fontSize: 48},
  body: {padding: 17},
  row: {flexDirection: 'row', alignItems: 'center'},
  mealName: {fontSize: 20, fontWeight: '900', color: '#171717', flex: 1, paddingRight: 8},
  badge: {fontSize: 10, fontWeight: '900', color: '#7a4d00', backgroundColor: '#fff0cf', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999},
  meta: {fontSize: 13, fontWeight: '700', color: '#6f6f6f', marginTop: 7},
  reason: {fontSize: 14, lineHeight: 21, color: '#555', marginTop: 10},
  cta: {fontSize: 14, fontWeight: '900', color: '#2457a7', marginTop: 14},
});
