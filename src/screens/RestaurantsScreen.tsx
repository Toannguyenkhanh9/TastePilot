import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {Restaurant} from '../types';
import {getCurrentLocation} from '../services/locationService';
import {getRestaurantsForMeal} from '../services/recommendationService';
import {resolveApiImageUrl} from '../services/imageUrl';
import {formatDistance} from '../utils/format';
import {useApp} from '../context/AppContext';

export function RestaurantsScreen({route, navigation}: NativeStackScreenProps<RootStackParamList, 'Restaurants'>) {
  const {meal, mode, destination, locationContext} = route.params;
  const {addHistory, addSaved, saved} = useApp();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let location = locationContext?.coordinates;
        if (!location && !destination) {
          try { location = await getCurrentLocation(); } catch { location = undefined; }
        }
        setRestaurants(await getRestaurantsForMeal(meal, location, destination));
      } catch (e) {
        Alert.alert('Could not find restaurants', e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [meal, destination, locationContext]);

  const choose = (place: Restaurant) => {
    addHistory({
      id: `${Date.now()}`,
      dishName: meal.name,
      cuisine: meal.cuisine,
      mode,
      restaurantName: place.name,
      city: locationContext?.city,
      country: locationContext?.country,
      currency: locationContext?.currency,
      createdAt: new Date().toISOString(),
    });
    Alert.alert('Saved to meal history', `${meal.name} at ${place.name}`);
  };

  const directions = (place: Restaurant) => {
    const destinationQuery = place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : `${place.name} ${place.address}`;
    const url = place.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}&destination_place_id=${encodeURIComponent(place.id)}`;
    Linking.openURL(url).catch(() => Alert.alert('Maps', 'Could not open maps.'));
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.loadingText}>Finding highly rated places…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>PLACES FOR</Text>
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.subtitle}>TastePilot weighs rating, review confidence and distance instead of rating alone.</Text>

      {restaurants.length === 0 ? <Text style={styles.empty}>No matching places were found in this area.</Text> : null}

      {restaurants.map(place => {
        const isSaved = saved.some(x => x.id === place.id);
        return (
          <View key={place.id} style={styles.card}>
            <Pressable onPress={() => navigation.navigate('RestaurantDetail', {place, meal, mode, locationContext})}>
              {place.imageUrl ? <Image source={{uri: resolveApiImageUrl(place.imageUrl)}} style={styles.image} /> : <View style={styles.imagePlaceholder}><Text style={styles.placeholderEmoji}>🍴</Text></View>}
            </Pressable>
            <View style={styles.body}>
              <Pressable onPress={() => navigation.navigate('RestaurantDetail', {place, meal, mode, locationContext})}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{place.name}</Text>
                  {place.openNow != null ? <Text style={[styles.openBadge, !place.openNow && styles.closedBadge]}>{place.openNow ? 'OPEN' : 'CLOSED'}</Text> : null}
                </View>
                <Text style={styles.meta}>⭐ {place.rating.toFixed(1)} · {place.reviews.toLocaleString()} reviews {place.distanceMeters != null ? `· ${formatDistance(place.distanceMeters)}` : ''}</Text>
                <Text style={styles.address}>{place.address}</Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable style={styles.secondary} onPress={() => addSaved(place)}><Text style={styles.secondaryText}>{isSaved ? 'Saved' : 'Save'}</Text></Pressable>
                <Pressable style={styles.secondary} onPress={() => directions(place)}><Text style={styles.secondaryText}>Directions</Text></Pressable>
                <Pressable style={styles.primary} onPress={() => choose(place)}><Text style={styles.primaryText}>Choose</Text></Pressable>
              </View>
              <Pressable style={styles.detailsButton} onPress={() => navigation.navigate('RestaurantDetail', {place, meal, mode, locationContext})}>
                <Text style={styles.detailsText}>Restaurant details →</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
  loadingText: {marginTop: 14, color: '#777'},
  container: {padding: 20, paddingBottom: 40, backgroundColor: '#fafafa'},
  eyebrow: {fontSize: 12, fontWeight: '900', letterSpacing: 1.4, color: '#777'},
  title: {fontSize: 30, fontWeight: '900', color: '#171717', marginTop: 8},
  subtitle: {fontSize: 14, lineHeight: 21, color: '#777', marginTop: 7, marginBottom: 20},
  empty: {fontSize: 14, color: '#777', paddingVertical: 30, textAlign: 'center'},
  card: {backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#ececec'},
  image: {width: '100%', height: 160, backgroundColor: '#eee'},
  imagePlaceholder: {width: '100%', height: 160, backgroundColor: '#edf3fb', alignItems: 'center', justifyContent: 'center'},
  placeholderEmoji: {fontSize: 42},
  body: {padding: 16},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  name: {fontSize: 18, fontWeight: '900', color: '#171717', flex: 1},
  openBadge: {fontSize: 9, fontWeight: '900', color: '#176b36', backgroundColor: '#e8f8ee', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999},
  closedBadge: {color: '#8a2d2d', backgroundColor: '#fdecec'},
  meta: {fontSize: 13, fontWeight: '700', color: '#555', marginTop: 6},
  address: {fontSize: 13, color: '#777', marginTop: 6, lineHeight: 19},
  actions: {flexDirection: 'row', marginTop: 14, gap: 8},
  secondary: {paddingHorizontal: 12, minHeight: 42, borderRadius: 12, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center'},
  secondaryText: {fontSize: 12, fontWeight: '800', color: '#333'},
  primary: {flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center'},
  primaryText: {fontSize: 12, fontWeight: '900', color: '#fff'},
  detailsButton: {marginTop: 12, alignItems: 'center', paddingVertical: 5},
  detailsText: {fontSize: 12, fontWeight: '900', color: '#2457a7'},
});
