import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {LocationContext} from '../types';

type Props = {
  value?: LocationContext | null;
  title?: string;
  loading?: boolean;
  onRefresh?: () => void;
};

export function LocationSummary({value, title, loading, onRefresh}: Props) {
  const {t} = useTranslation();
  const resolvedTitle = title || t('daily.yourArea');

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>📍</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{resolvedTitle.toUpperCase()}</Text>
        <Text style={styles.value}>
          {value
            ? [value.city, value.country].filter(Boolean).join(', ') || value.formattedAddress
            : t('common.locationNotDetected')}
        </Text>
        <Text style={styles.meta}>
          {t('common.localCurrency')} · {value?.currency || '—'}
        </Text>
      </View>
      {onRefresh ? (
        <Pressable style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
          {loading ? <ActivityIndicator size="small" /> : <Text style={styles.refreshText}>{t('common.refresh')}</Text>}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#f2f6fb',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e3ebf4',
    marginTop: 4,
    marginBottom: 10,
  },
  iconBox: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  icon: {fontSize: 22},
  content: {flex: 1, marginLeft: 12},
  label: {fontSize: 11, fontWeight: '900', letterSpacing: 1.1, color: '#6f8096'},
  value: {fontSize: 16, fontWeight: '900', color: '#1a2433', marginTop: 2},
  meta: {fontSize: 12, color: '#78879b', marginTop: 4},
  refreshButton: {paddingHorizontal: 10, paddingVertical: 8},
  refreshText: {fontSize: 14, fontWeight: '800', color: '#2c5da9'},
});
