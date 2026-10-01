import React from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Chip} from './Chip';
import {
  MealType,
  NotificationFrequency,
  SmartNotificationSettings,
} from '../types';

type Props = {
  value: SmartNotificationSettings;
  onChange: (next: SmartNotificationSettings) => void;
};

const frequencyDefs: Array<{id: NotificationFrequency; key: string}> = [
  {id: 'daily', key: 'smartNotifFreqDaily'},
  {id: 'weekdays', key: 'smartNotifFreqWeekdays'},
  {id: 'three_per_week', key: 'smartNotifFreqThreePerWeek'},
  {id: 'weekends', key: 'smartNotifFreqWeekends'},
];

const mealDefs: Array<{id: MealType; key: string}> = [
  {id: 'breakfast', key: 'mealTypeBreakfast'},
  {id: 'lunch', key: 'mealTypeLunch'},
  {id: 'dinner', key: 'mealTypeDinner'},
];

export function SmartNotificationSettingsCard({value, onChange}: Props) {
  const {t} = useTranslation();

  const patch = (next: Partial<SmartNotificationSettings>) =>
    onChange({...value, ...next});

  const toggleMeal = (meal: MealType) => {
    const meals = value.meals.includes(meal)
      ? value.meals.filter(item => item !== meal)
      : [...value.meals, meal];
    patch({meals});
  };

  const setMealTime = (meal: MealType, time: string) => {
    if (meal === 'breakfast') return patch({breakfastTime: time});
    if (meal === 'dinner') return patch({dinnerTime: time});
    patch({lunchTime: time});
  };

  const mealTime = (meal: MealType) => {
    if (meal === 'breakfast') return value.breakfastTime;
    if (meal === 'dinner') return value.dinnerTime;
    return value.lunchTime;
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{t('smartNotifTitle')}</Text>
          <Text style={styles.subtitle}>{t('smartNotifSubtitle')}</Text>
        </View>
        <Switch
          value={value.enabled}
          onValueChange={enabled => patch({enabled})}
        />
      </View>

      {value.enabled ? (
        <>
          <Text style={styles.label}>{t('smartNotifFrequency')}</Text>
          <View style={styles.chips}>
            {frequencyDefs.map(item => (
              <Chip
                key={item.id}
                label={t(item.key)}
                selected={value.frequency === item.id}
                onPress={() => patch({frequency: item.id})}
              />
            ))}
          </View>

          <Text style={styles.label}>{t('smartNotifMeals')}</Text>
          <View style={styles.chips}>
            {mealDefs.map(item => (
              <Chip
                key={item.id}
                label={t(item.key)}
                selected={value.meals.includes(item.id)}
                onPress={() => toggleMeal(item.id)}
              />
            ))}
          </View>

          <Text style={styles.helper}>{t('smartNotifTimeHint')}</Text>

          <View style={styles.timeGrid}>
            {mealDefs
              .filter(item => value.meals.includes(item.id))
              .map(item => (
                <View style={styles.timeItem} key={item.id}>
                  <Text style={styles.timeLabel}>{t(item.key)}</Text>
                  <TextInput
                    value={mealTime(item.id)}
                    onChangeText={time => setMealTime(item.id, time)}
                    style={styles.timeInput}
                    placeholder="11:30"
                    placeholderTextColor="#aaa"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              ))}
          </View>

          <View style={styles.travelRow}>
            <View style={styles.travelCopy}>
              <Text style={styles.travelTitle}>{t('smartNotifTravelToggle')}</Text>
              <Text style={styles.travelText}>
                {t('smartNotifTravelToggleHint', {
                  distance: value.travelRadiusMeters / 1000,
                })}
              </Text>
            </View>
            <Switch
              value={value.travelNearbyEnabled}
              onValueChange={travelNearbyEnabled => patch({travelNearbyEnabled})}
            />
          </View>

          <Text style={styles.note}>ℹ️ {t('smartNotifPrivacyNote')}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,253,249,0.97)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efd9cc',
    marginBottom: 14,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  copy: {flex: 1, paddingRight: 12},
  title: {fontSize: 16, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 12, lineHeight: 18, color: '#766b64', marginTop: 5},
  label: {fontSize: 13, fontWeight: '900', color: '#333', marginTop: 18},
  chips: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 9},
  helper: {fontSize: 12, lineHeight: 18, color: '#777', marginTop: 8},
  timeGrid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
  timeItem: {width: '31%', minWidth: 92, marginRight: '2%', marginBottom: 10},
  timeLabel: {fontSize: 11, fontWeight: '800', color: '#666', marginBottom: 6},
  timeInput: {
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#eadbd1',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
  },
  travelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#efe4dc',
  },
  travelCopy: {flex: 1, paddingRight: 12},
  travelTitle: {fontSize: 13, fontWeight: '900', color: '#333'},
  travelText: {fontSize: 12, lineHeight: 18, color: '#777', marginTop: 4},
  note: {
    marginTop: 12,
    backgroundColor: '#f1f6e8',
    borderRadius: 12,
    padding: 11,
    fontSize: 11,
    lineHeight: 17,
    color: '#62774b',
    fontWeight: '700',
  },
});
