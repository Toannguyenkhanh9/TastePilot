import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../context/AppContext';

export function SavedScreen() {
  const {saved, removeSaved} = useApp();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Saved Places</Text>
      <Text style={styles.subtitle}>Keep restaurants you want to try later.</Text>
      {saved.length === 0 ? <Text style={styles.empty}>Nothing saved yet.</Text> : saved.map(place => (
        <View key={place.id} style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.name}>{place.name}</Text>
            <Text style={styles.meta}>⭐ {place.rating.toFixed(1)} · {place.address}</Text>
          </View>
          <Pressable onPress={() => removeSaved(place.id)}><Text style={styles.remove}>Remove</Text></Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 40, backgroundColor: '#fafafa', flexGrow: 1},
  title: {fontSize: 28, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 14, color: '#777', marginTop: 8, marginBottom: 20},
  empty: {backgroundColor: '#fff', borderRadius: 18, padding: 18, color: '#777'},
  row: {flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, alignItems: 'center'},
  name: {fontSize: 16, fontWeight: '900', color: '#222'},
  meta: {fontSize: 12, color: '#777', marginTop: 5},
  remove: {fontSize: 12, fontWeight: '800', color: '#9c2d2d', padding: 8},
});
