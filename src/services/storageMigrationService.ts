import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LocationContext,
  MealHistoryItem,
  Restaurant,
  UserProfile,
  WeeklyMealPlan,
} from '../types';

export const STORAGE_KEYS = {
  profile: '@foodpilot/profile',
  history: '@foodpilot/history',
  saved: '@foodpilot/saved',
  location: '@foodpilot/location-context',
  weeklyPlan: '@foodpilot/weekly-plan',
  schema: '@tastepilot/schema-version',
} as const;

export const CURRENT_STORAGE_SCHEMA = 6;

const validMoods = new Set([
  'quick','healthy','comfort','date_night','family','late_night','hot','light',
]);

export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function finitePositive(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string').slice(0, 50)
    : [];
}

export function migrateProfileRecord(
  raw: Partial<UserProfile> | null | undefined,
  fallback: UserProfile,
): UserProfile {
  const source = raw || {};
  const recentMood =
    typeof source.recentMood === 'string' && validMoods.has(source.recentMood)
      ? source.recentMood
      : undefined;

  return {
    ...fallback,
    ...source,
    currency:
      typeof source.currency === 'string' && source.currency.length <= 8
        ? source.currency
        : fallback.currency,
    locale:
      typeof source.locale === 'string' && source.locale.length <= 32
        ? source.locale
        : fallback.locale,
    defaultBudget: finitePositive(source.defaultBudget, fallback.defaultBudget),
    preferences: stringArray(source.preferences),
    restrictions: stringArray(source.restrictions),
    allergies: Array.isArray(source.allergies)
      ? source.allergies.filter(item =>
          ['Peanuts','Shellfish','Dairy','Egg','Sesame'].includes(String(item)),
        ).slice(0, 5) as UserProfile['allergies']
      : [],
    spicePreference:
      ['any','mild','medium','spicy'].includes(String(source.spicePreference))
        ? source.spicePreference
        : 'any',
    recentMood: recentMood as UserProfile['recentMood'],
  };
}

function validLocation(value: unknown): value is LocationContext {
  if (!value || typeof value !== 'object') return false;
  const item = value as LocationContext;
  const lat = Number(item.coordinates?.latitude);
  const lng = Number(item.coordinates?.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    typeof item.currency === 'string'
  );
}

export async function runStorageMigrations() {
  const entries = await AsyncStorage.multiGet([
    STORAGE_KEYS.profile,
    STORAGE_KEYS.history,
    STORAGE_KEYS.saved,
    STORAGE_KEYS.location,
    STORAGE_KEYS.weeklyPlan,
    STORAGE_KEYS.schema,
  ]);

  const map = Object.fromEntries(entries);
  const writes: Array<[string, string]> = [];
  const removals: string[] = [];

  // Corrupt history/saved data should not block app startup.
  const history = safeJsonParse<MealHistoryItem[]>(map[STORAGE_KEYS.history], []);
  if (Array.isArray(history)) {
    writes.push([
      STORAGE_KEYS.history,
      JSON.stringify(history.filter(Boolean).slice(0, 100)),
    ]);
  } else {
    removals.push(STORAGE_KEYS.history);
  }

  const saved = safeJsonParse<Restaurant[]>(map[STORAGE_KEYS.saved], []);
  if (Array.isArray(saved)) {
    writes.push([
      STORAGE_KEYS.saved,
      JSON.stringify(saved.filter(Boolean).slice(0, 250)),
    ]);
  } else {
    removals.push(STORAGE_KEYS.saved);
  }

  const location = safeJsonParse<LocationContext | null>(
    map[STORAGE_KEYS.location],
    null,
  );
  if (location && !validLocation(location)) {
    removals.push(STORAGE_KEYS.location);
  }

  const weeklyPlan = safeJsonParse<WeeklyMealPlan | null>(
    map[STORAGE_KEYS.weeklyPlan],
    null,
  );
  if (
    weeklyPlan &&
    (!Array.isArray(weeklyPlan.days) ||
      weeklyPlan.days.length > 7 ||
      typeof weeklyPlan.createdAt !== 'string')
  ) {
    removals.push(STORAGE_KEYS.weeklyPlan);
  }

  writes.push([STORAGE_KEYS.schema, String(CURRENT_STORAGE_SCHEMA)]);

  if (writes.length) await AsyncStorage.multiSet(writes);
  if (removals.length) await AsyncStorage.multiRemove(removals);
}
