import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {MealType, MealTypeSelection} from '../types';
import {resolveMealType} from '../services/mealPeriodService';

type Props = {
  value: MealTypeSelection;
  onChange: (value: MealTypeSelection) => void;
  mode: 'daily' | 'travel';
};

const items: Array<{value: MealTypeSelection; key: string}> = [
  {value: 'auto', key: 'mealTypeAuto'},
  {value: 'breakfast', key: 'mealTypeBreakfast'},
  {value: 'lunch', key: 'mealTypeLunch'},
  {value: 'dinner', key: 'mealTypeDinner'},
];

function labelForMeal(t: any, meal: MealType) {
  if (meal === 'breakfast') return t('mealTypeBreakfast');
  if (meal === 'lunch') return t('mealTypeLunch');
  return t('mealTypeDinner');
}

export function MealTypeSelector({value, onChange, mode}: Props) {
  const {t} = useTranslation();
  const resolved = resolveMealType(value);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('mealTypeTitle')}</Text>
        {value === 'auto' ? (
          <Text style={styles.autoHint}>
            {t('mealTypeAutoHint', {meal: labelForMeal(t, resolved)})}
          </Text>
        ) : null}
      </View>

      <View style={styles.row}>
        {items.map(item => {
          const active = value === item.value;
          return (
            <Pressable
              key={item.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(item.value)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(item.key)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.help}>
        {mode === 'travel' ? t('mealTypeTravelHint') : t('mealTypeDailyHint')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eadfd7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {fontSize: 14, fontWeight: '900', color: '#252525'},
  autoHint: {fontSize: 11, fontWeight: '800', color: '#8b684c'},
  row: {flexDirection: 'row', flexWrap: 'wrap'},
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f2f2f2',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {backgroundColor: '#1d2735'},
  chipText: {fontSize: 12, fontWeight: '800', color: '#555'},
  chipTextActive: {color: '#fff'},
  help: {fontSize: 12, lineHeight: 18, color: '#777', marginTop: 2},
});
