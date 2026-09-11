import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../context/AppContext';

export function HistoryScreen() {
  const {history} = useApp();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meal History</Text>
      <Text style={styles.subtitle}>Recent meals are used to avoid repetitive recommendations.</Text>
      {history.length === 0 ? <Text style={styles.empty}>No meals yet. Choose a restaurant from a recommendation to start your history.</Text> : history.map(item => {
        const area = [item.city, item.country].filter(Boolean).join(', ');
        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.icon}><Text>{item.mode === 'travel' ? '✈️' : '🍽️'}</Text></View>
            <View style={{flex: 1}}>
              <Text style={styles.name}>{item.dishName}</Text>
              <Text style={styles.meta}>{item.restaurantName || item.cuisine}</Text>
              {area ? <Text style={styles.area}>📍 {area}</Text> : null}
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, paddingBottom: 40, backgroundColor: '#fafafa', flexGrow: 1},
  title: {fontSize: 28, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 14, color: '#777', lineHeight: 21, marginTop: 8, marginBottom: 20},
  empty: {backgroundColor: '#fff', borderRadius: 18, padding: 18, color: '#777', lineHeight: 20},
  row: {flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10, alignItems: 'center'},
  icon: {width: 42, height: 42, borderRadius: 13, backgroundColor: '#f3f3f3', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  name: {fontSize: 16, fontWeight: '900', color: '#222'},
  meta: {fontSize: 13, color: '#666', marginTop: 3},
  area: {fontSize: 11, color: '#65738a', marginTop: 4},
  date: {fontSize: 11, color: '#999', marginTop: 4},
});
