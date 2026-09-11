import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {RestaurantDetails} from '../types';
import {getRestaurantDetails} from '../services/placeService';
import {resolveApiImageUrl} from '../services/imageUrl';
import {formatDistance} from '../utils/format';
import {useApp} from '../context/AppContext';

export function RestaurantDetailScreen({route}: NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>) {
  const {place, meal, mode, locationContext} = route.params;
  const {addHistory, addSaved, saved: savedPlaces} = useApp();
  const [details, setDetails] = useState<RestaurantDetails>(place);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurantDetails(place)
      .then(setDetails)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [place]);

  const directions = () => {
    const destination = details.latitude != null && details.longitude != null
      ? `${details.latitude},${details.longitude}`
      : `${details.name} ${details.address}`;
    const url = details.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&destination_place_id=${encodeURIComponent(details.id)}`;
    Linking.openURL(url).catch(() => Alert.alert('Maps', 'Could not open maps.'));
  };

  const choose = () => {
    addHistory({
      id: `${Date.now()}`,
      dishName: meal.name,
      cuisine: meal.cuisine,
      mode,
      restaurantName: details.name,
      city: locationContext?.city,
      country: locationContext?.country,
      currency: locationContext?.currency,
      createdAt: new Date().toISOString(),
    });
    Alert.alert('Meal selected', `${meal.name} at ${details.name} was added to your history.`);
  };

  const isSaved = savedPlaces.some(x => x.id === details.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {details.imageUrl ? <Image source={{uri: resolveApiImageUrl(details.imageUrl)}} style={styles.hero} /> : <View style={styles.heroPlaceholder}><Text style={styles.heroEmoji}>🍽️</Text></View>}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{details.name}</Text>
          {details.openNow != null ? <Text style={[styles.openBadge, !details.openNow && styles.closedBadge]}>{details.openNow ? 'OPEN' : 'CLOSED'}</Text> : null}
        </View>

        <Text style={styles.meta}>⭐ {details.rating.toFixed(1)} · {details.reviews.toLocaleString()} reviews {details.distanceMeters != null ? `· ${formatDistance(details.distanceMeters)}` : ''}</Text>
        {details.primaryType ? <Text style={styles.type}>{details.primaryType.replace(/_/g, ' ')}</Text> : null}
        <Text style={styles.address}>{details.address}</Text>

        {loading ? <ActivityIndicator style={{marginTop: 20}} /> : null}
        {details.editorialSummary ? <Text style={styles.summary}>{details.editorialSummary}</Text> : null}

        <View style={styles.buttonRow}>
          <Pressable style={styles.lightButton} onPress={() => addSaved(details)}><Text style={styles.lightButtonText}>{isSaved ? 'Saved' : 'Save'}</Text></Pressable>
          <Pressable style={styles.lightButton} onPress={directions}><Text style={styles.lightButtonText}>Directions</Text></Pressable>
          <Pressable style={styles.darkButton} onPress={choose}><Text style={styles.darkButtonText}>Choose</Text></Pressable>
        </View>

        {details.websiteUri || details.phone || details.internationalPhone ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {details.websiteUri ? <Pressable onPress={() => Linking.openURL(details.websiteUri!)}><Text style={styles.link}>Open website</Text></Pressable> : null}
            {details.phone || details.internationalPhone ? <Pressable onPress={() => Linking.openURL(`tel:${details.internationalPhone || details.phone}`)}><Text style={styles.link}>{details.internationalPhone || details.phone}</Text></Pressable> : null}
          </View>
        ) : null}

        {details.openingHours?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening hours</Text>
            {details.openingHours.map((line, index) => <Text key={`${line}-${index}`} style={styles.hours}>{line}</Text>)}
          </View>
        ) : null}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>About menu and price data</Text>
          <Text style={styles.noticeText}>TastePilot does not claim that this restaurant serves an exact dish or price unless that information comes from a verified menu source.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#fff', paddingBottom: 40},
  hero: {width: '100%', height: 250, backgroundColor: '#eee'},
  heroPlaceholder: {width: '100%', height: 250, backgroundColor: '#edf3fb', alignItems: 'center', justifyContent: 'center'},
  heroEmoji: {fontSize: 62},
  content: {padding: 20},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  title: {fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#171717', flex: 1},
  openBadge: {fontSize: 9, fontWeight: '900', color: '#176b36', backgroundColor: '#e8f8ee', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999},
  closedBadge: {color: '#8a2d2d', backgroundColor: '#fdecec'},
  meta: {fontSize: 14, fontWeight: '800', color: '#555', marginTop: 10},
  type: {fontSize: 12, fontWeight: '800', textTransform: 'capitalize', color: '#6c7890', marginTop: 7},
  address: {fontSize: 14, lineHeight: 21, color: '#777', marginTop: 8},
  summary: {fontSize: 14, lineHeight: 22, color: '#4c5562', marginTop: 18},
  buttonRow: {flexDirection: 'row', gap: 8, marginTop: 22},
  lightButton: {minHeight: 46, paddingHorizontal: 14, borderRadius: 13, backgroundColor: '#f1f3f6', alignItems: 'center', justifyContent: 'center'},
  lightButtonText: {fontSize: 12, fontWeight: '900', color: '#2e3744'},
  darkButton: {flex: 1, minHeight: 46, borderRadius: 13, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center'},
  darkButtonText: {fontSize: 12, fontWeight: '900', color: '#fff'},
  section: {borderTopWidth: 1, borderTopColor: '#eceff3', marginTop: 24, paddingTop: 20},
  sectionTitle: {fontSize: 16, fontWeight: '900', color: '#1b2430', marginBottom: 10},
  link: {fontSize: 14, color: '#2457a7', fontWeight: '800', marginBottom: 9},
  hours: {fontSize: 13, lineHeight: 21, color: '#596473', marginBottom: 3},
  notice: {backgroundColor: '#fff8e8', borderRadius: 16, padding: 15, marginTop: 24},
  noticeTitle: {fontSize: 13, fontWeight: '900', color: '#63470e'},
  noticeText: {fontSize: 12, lineHeight: 18, color: '#80662d', marginTop: 5},
});
