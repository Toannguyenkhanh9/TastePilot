import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {LocationContext} from '../types';

type Props = {
  value?: LocationContext | null;
  loading?: boolean;
  onRefresh?: () => void;
  title?: string;
};

export function LocationSummary({value, loading, onRefresh, title = 'Your area'}: Props) {
  const place = [value?.city, value?.country].filter(Boolean).join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.icon}><Text style={styles.iconText}>📍</Text></View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>{title}</Text>
        <Text style={styles.place}>{loading ? 'Detecting location…' : place || 'Location not detected yet'}</Text>
        {value?.currency ? <Text style={styles.meta}>Local currency · {value.currency}</Text> : null}
      </View>
      {onRefresh ? (
        <Pressable style={styles.refresh} onPress={onRefresh} disabled={loading}>
          <Text style={styles.refreshText}>{loading ? '…' : 'Refresh'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f8ff', borderRadius: 18, padding: 14, marginTop: 18, borderWidth: 1, borderColor: '#e4edf9'},
  icon: {width: 42, height: 42, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  iconText: {fontSize: 20},
  copy: {flex: 1, marginLeft: 12},
  kicker: {fontSize: 11, fontWeight: '900', letterSpacing: 0.7, color: '#6a7890', textTransform: 'uppercase'},
  place: {fontSize: 15, fontWeight: '900', color: '#1b2430', marginTop: 3},
  meta: {fontSize: 12, color: '#6a7890', marginTop: 3},
  refresh: {paddingHorizontal: 10, paddingVertical: 8},
  refreshText: {fontSize: 12, fontWeight: '900', color: '#2457a7'},
});
