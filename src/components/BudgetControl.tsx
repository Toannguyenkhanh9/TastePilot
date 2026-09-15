import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';

type Props = {
  currency: string;
  locale?: string;
  enabled: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onEnabledChange: (enabled: boolean) => void;
  onFocus?: () => void;
  placeholder?: string;
};

export function BudgetControl({
  currency,
  enabled,
  value,
  onChangeText,
  onEnabledChange,
  onFocus,
  placeholder,
}: Props) {
  const {t} = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.label}>{t('budgetTargetTitle')} ({currency})</Text>
          <Text style={styles.optional}>{t('budgetOptional')}</Text>
        </View>

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentItem, enabled && styles.segmentItemActive]}
            onPress={() => onEnabledChange(true)}>
            <Text style={[styles.segmentText, enabled && styles.segmentTextActive]}>
              {t('budgetUse')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentItem, !enabled && styles.segmentItemActive]}
            onPress={() => onEnabledChange(false)}>
            <Text style={[styles.segmentText, !enabled && styles.segmentTextActive]}>
              {t('budgetNoLimit')}
            </Text>
          </Pressable>
        </View>
      </View>

      {enabled ? (
        <>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            keyboardType="number-pad"
            returnKeyType="done"
            placeholder={placeholder || t('budgetPlaceholder', {currency})}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.hint}>{t('budgetWindowHint')}</Text>
        </>
      ) : (
        <View style={styles.noBudgetCard}>
          <Text style={styles.noBudgetTitle}>{t('budgetNoLimitTitle')}</Text>
          <Text style={styles.noBudgetText}>{t('budgetNoLimitHint')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginTop: 10, marginBottom: 6},
  topRow: {marginBottom: 10},
  titleWrap: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  label: {fontSize: 14, fontWeight: '900', color: '#303030'},
  optional: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f2f2f2',
    color: '#777',
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#f1f1f1',
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentItemActive: {backgroundColor: '#1d2735'},
  segmentText: {fontSize: 12, fontWeight: '800', color: '#666'},
  segmentTextActive: {color: '#fff'},
  input: {
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eadfd7',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '800',
    color: '#171717',
  },
  hint: {fontSize: 12, lineHeight: 18, color: '#6c7890', marginTop: 8},
  noBudgetCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e5e8ed',
  },
  noBudgetTitle: {fontSize: 14, fontWeight: '900', color: '#263244'},
  noBudgetText: {fontSize: 12, lineHeight: 18, color: '#6d7888', marginTop: 5},
});
