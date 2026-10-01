import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {LocationContext} from '../types';

type Props = {
  value?: LocationContext | null;
  title?: string;
  loading?: boolean;
  onRefresh?: () => void;
  appearance?: 'default' | 'home';
};

export function LocationSummary({value, title, loading, onRefresh, appearance = 'default'}: Props) {
  const {t} = useTranslation();
  const resolvedTitle = title || t('daily.yourArea');

  return (
    <View style={[styles.wrap, appearance === 'home' && styles.wrapHome]}>
      <View style={[styles.iconBox, appearance === 'home' && styles.iconBoxHome]}>
        <Text style={styles.icon}>📍</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, appearance === 'home' && styles.labelHome]}>{resolvedTitle.toUpperCase()}</Text>
        <Text style={[styles.value, appearance === 'home' && styles.valueHome]}>
          {value
            ? [value.city, value.country].filter(Boolean).join(', ') || value.formattedAddress
            : t('common.locationNotDetected')}
        </Text>
        <Text style={[styles.meta, appearance === 'home' && styles.metaHome]}>
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
    backgroundColor: '#f1f6e8',
    padding: 14,
    borderWidth: 1,
    borderColor: '#dce7ca',
    marginTop: 4,
    marginBottom: 10,
  },
  wrapHome: {backgroundColor: '#eef5df', borderColor: '#dce8c4', shadowColor: '#718043', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: {width: 0, height: 5}, elevation: 2},
  iconBox: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  iconBoxHome: {backgroundColor: '#fffdf6'},
  icon: {fontSize: 22},
  content: {flex: 1, marginLeft: 12},
  label: {fontSize: 11, fontWeight: '900', letterSpacing: 1.1, color: '#667a4c'},
  value: {fontSize: 16, fontWeight: '900', color: '#303920', marginTop: 2},
  meta: {fontSize: 12, color: '#758064', marginTop: 4},
  labelHome: {color: '#62803f'},
  valueHome: {color: '#2d361d'},
  metaHome: {color: '#74805e'},
  refreshButton: {paddingHorizontal: 10, paddingVertical: 8},
  refreshText: {fontSize: 14, fontWeight: '800', color: '#c5522f'},
});
