import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import i18n, {localeToLanguageCode} from '../i18n';
import {
  LocationContext,
  MealHistoryItem,
  MealType,
  NotificationFrequency,
  SmartNotificationSettings,
  UserProfile,
} from '../types';
import {getCurrentMealType} from './mealPeriodService';
import {getLocalRecommendations} from './localRecommendationService';
import {getRestaurantsForMeal} from './recommendationService';

const MEAL_CHANNEL_ID = 'tastepilot-smart-meals';
const TRAVEL_CHANNEL_ID = 'tastepilot-travel-nearby';
const SMART_TRIGGER_PREFIX = 'tastepilot:smart-meal:';
const NEARBY_LAST_CHECK_KEY = '@tastepilot/smart-notification/nearby-last-check';
const NEARBY_LAST_ALERT_KEY = '@tastepilot/smart-notification/nearby-last-alert';

const SCHEDULE_DAYS_AHEAD = 14;
const MAX_SCHEDULED_MEAL_NOTIFICATIONS = 42;
const NEARBY_CHECK_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const NEARBY_ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const FRESH_LOCATION_MAX_AGE_MS = 30 * 60 * 1000;

export const DEFAULT_SMART_NOTIFICATION_SETTINGS: SmartNotificationSettings = {
  enabled: false,
  frequency: 'weekdays',
  meals: ['lunch'],
  breakfastTime: '07:30',
  lunchTime: '11:30',
  dinnerTime: '18:30',
  travelNearbyEnabled: true,
  travelRadiusMeters: 1000,
};

export function normalizeSmartNotificationSettings(
  value?: Partial<SmartNotificationSettings>,
): SmartNotificationSettings {
  return {
    ...DEFAULT_SMART_NOTIFICATION_SETTINGS,
    ...(value || {}),
    meals: Array.isArray(value?.meals)
      ? value!.meals.filter(
          (item): item is MealType =>
            item === 'breakfast' || item === 'lunch' || item === 'dinner',
        )
      : DEFAULT_SMART_NOTIFICATION_SETTINGS.meals,
    travelRadiusMeters:
      Number(value?.travelRadiusMeters) > 0
        ? Number(value?.travelRadiusMeters)
        : DEFAULT_SMART_NOTIFICATION_SETTINGS.travelRadiusMeters,
  };
}

export function isValidNotificationTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim());
  return !!match;
}

function parseTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return {hour, minute};
}

function mealTime(settings: SmartNotificationSettings, meal: MealType) {
  if (meal === 'breakfast') return settings.breakfastTime;
  if (meal === 'dinner') return settings.dinnerTime;
  return settings.lunchTime;
}

function frequencyAllowsDate(frequency: NotificationFrequency, date: Date) {
  const day = date.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  if (frequency === 'daily') return true;
  if (frequency === 'weekdays') return day >= 1 && day <= 5;
  if (frequency === 'weekends') return day === 0 || day === 6;
  // Monday / Wednesday / Friday.
  return day === 1 || day === 3 || day === 5;
}

function localeLng(profile: UserProfile) {
  return localeToLanguageCode(profile.locale);
}

function mealLabel(meal: MealType, lng: string) {
  const key =
    meal === 'breakfast'
      ? 'mealTypeBreakfast'
      : meal === 'dinner'
        ? 'mealTypeDinner'
        : 'mealTypeLunch';
  return i18n.t(key, {lng});
}

async function ensureChannels() {
  await notifee.createChannel({
    id: MEAL_CHANNEL_ID,
    name: 'TastePilot meal reminders',
    importance: AndroidImportance.DEFAULT,
  });
  await notifee.createChannel({
    id: TRAVEL_CHANNEL_ID,
    name: 'TastePilot nearby travel food',
    importance: AndroidImportance.DEFAULT,
  });
}

async function notificationPermissionGranted() {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function requestSmartNotificationPermission() {
  const settings = await notifee.requestPermission();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
  if (granted) await ensureChannels();
  return granted;
}

async function cancelSmartMealTriggers() {
  const ids = await notifee.getTriggerNotificationIds();
  const ours = ids.filter(id => id.startsWith(SMART_TRIGGER_PREFIX));
  await Promise.all(ours.map(id => notifee.cancelTriggerNotification(id)));
}

function localizedDailyPicks(
  meal: MealType,
  profile: UserProfile,
  history: MealHistoryItem[],
  locationContext: LocationContext | null,
  excludeDishNames: string[] = [],
) {
  return getLocalRecommendations({
    mode: 'daily',
    profile,
    history,
    locationContext: locationContext || undefined,
    mealType: meal,
    excludeDishNames,
    // Notification suggestions should remain useful even if the user's default
    // budget is unusually strict, so budget is intentionally not hard-filtered here.
    budget: undefined,
    limit: 5,
  });
}

export async function syncSmartMealNotifications(input: {
  profile: UserProfile;
  history: MealHistoryItem[];
  locationContext: LocationContext | null;
}) {
  const settings = normalizeSmartNotificationSettings(
    input.profile.smartNotifications,
  );

  await cancelSmartMealTriggers();

  if (!settings.enabled || settings.meals.length === 0) {
    return {scheduled: 0};
  }

  if (!(await notificationPermissionGranted())) {
    return {scheduled: 0};
  }

  await ensureChannels();

  const lng = localeLng(input.profile);
  const now = new Date();
  const scheduledExclusions = new Map<MealType, string[]>();
  let scheduled = 0;

  for (let offset = 0; offset < SCHEDULE_DAYS_AHEAD; offset += 1) {
    if (scheduled >= MAX_SCHEDULED_MEAL_NOTIFICATIONS) break;

    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
      0,
      0,
      0,
      0,
    );

    if (!frequencyAllowsDate(settings.frequency, day)) continue;

    for (const meal of settings.meals) {
      if (scheduled >= MAX_SCHEDULED_MEAL_NOTIFICATIONS) break;

      const time = mealTime(settings, meal);
      if (!isValidNotificationTime(time)) continue;
      const {hour, minute} = parseTime(time);

      const at = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hour,
        minute,
        0,
        0,
      );

      if (at.getTime() <= now.getTime() + 60_000) continue;

      const previousExclusions = scheduledExclusions.get(meal) || [];
      let mealPicks = localizedDailyPicks(
        meal,
        input.profile,
        input.history,
        input.locationContext,
        previousExclusions,
      );

      // If the rotation becomes too restrictive, reset it and keep the reminder useful.
      if (mealPicks.length < 3 && previousExclusions.length) {
        mealPicks = localizedDailyPicks(
          meal,
          input.profile,
          input.history,
          input.locationContext,
        );
      }

      const names = mealPicks.map(item => item.name);
      const canonicalNames = mealPicks.map(
        item => item.canonicalName || item.name,
      );
      scheduledExclusions.set(
        meal,
        [...previousExclusions, ...canonicalNames].slice(-10),
      );

      const sample = names.slice(0, 3).join(' · ');
      const count = Math.max(0, names.length);

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: at.getTime(),
      };

      const id = `${SMART_TRIGGER_PREFIX}${meal}:${at.getFullYear()}-${String(
        at.getMonth() + 1,
      ).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;

      await notifee.createTriggerNotification(
        {
          id,
          title: i18n.t('smartNotifMealTitle', {
            lng,
            meal: mealLabel(meal, lng),
          }),
          body: count
            ? i18n.t('smartNotifMealBody', {
                lng,
                count,
                dishes: sample,
              })
            : i18n.t('smartNotifMealBodyFallback', {lng}),
          data: {
            tastepilotRoute: 'DailyMeal',
            mealType: meal,
          },
          android: {
            channelId: MEAL_CHANNEL_ID,
            pressAction: {id: 'default'},
          },
          ios: {
            sound: 'default',
          },
        },
        trigger,
      );

      scheduled += 1;
    }
  }

  return {scheduled};
}

function hasFreshCurrentLocation(locationContext: LocationContext | null) {
  if (!locationContext || locationContext.source !== 'current') return false;
  if (!locationContext.countryCode) return false;
  if (!locationContext.resolvedAt) return false;
  const age = Date.now() - new Date(locationContext.resolvedAt).getTime();
  return Number.isFinite(age) && age >= 0 && age <= FRESH_LOCATION_MAX_AGE_MS;
}

async function readTimestamp(key: string) {
  const raw = await AsyncStorage.getItem(key);
  const value = Number(raw || 0);
  return Number.isFinite(value) ? value : 0;
}

async function writeTimestamp(key: string, value: number) {
  await AsyncStorage.setItem(key, String(value));
}

export async function maybeShowNearbyTravelAlert(input: {
  profile: UserProfile;
  history: MealHistoryItem[];
  locationContext: LocationContext | null;
}) {
  const settings = normalizeSmartNotificationSettings(
    input.profile.smartNotifications,
  );

  if (
    !settings.enabled ||
    !settings.travelNearbyEnabled ||
    !hasFreshCurrentLocation(input.locationContext)
  ) {
    return {shown: false, reason: 'disabled-or-stale-location'};
  }

  if (!frequencyAllowsDate(settings.frequency, new Date())) {
    return {shown: false, reason: 'frequency'};
  }

  if (!(await notificationPermissionGranted())) {
    return {shown: false, reason: 'permission'};
  }

  const now = Date.now();
  const lastAlert = await readTimestamp(NEARBY_LAST_ALERT_KEY);
  if (now - lastAlert < NEARBY_ALERT_COOLDOWN_MS) {
    return {shown: false, reason: 'alert-cooldown'};
  }

  const lastCheck = await readTimestamp(NEARBY_LAST_CHECK_KEY);
  if (now - lastCheck < NEARBY_CHECK_COOLDOWN_MS) {
    return {shown: false, reason: 'check-cooldown'};
  }

  // Write before network calls so rapid app resume events do not duplicate Places traffic.
  await writeTimestamp(NEARBY_LAST_CHECK_KEY, now);
  await ensureChannels();

  const locationContext = input.locationContext!;
  const mealType = getCurrentMealType();

  const candidates = getLocalRecommendations({
    mode: 'travel',
    profile: input.profile,
    history: input.history,
    locationContext,
    mealType,
    travelCategory: 'must_try',
    limit: 5,
  });

  const nearbyDishNames: string[] = [];

  // Keep Places usage bounded: at most 3 live restaurant searches per check.
  for (const meal of candidates.slice(0, 3)) {
    try {
      const restaurants = await getRestaurantsForMeal(
        meal,
        locationContext.coordinates,
      );
      const hasNearby = restaurants.some(
        place =>
          typeof place.distanceMeters === 'number' &&
          place.distanceMeters <= settings.travelRadiusMeters,
      );
      if (hasNearby) nearbyDishNames.push(meal.name);
    } catch {
      // A single Places failure should not break the rest of the check.
    }
  }

  if (nearbyDishNames.length < 3) {
    return {shown: false, reason: 'fewer-than-three-nearby'};
  }

  const lng = localeLng(input.profile);
  const radiusKm = Math.max(
    0.1,
    Math.round((settings.travelRadiusMeters / 1000) * 10) / 10,
  );

  await notifee.displayNotification({
    title: i18n.t('smartNotifTravelTitle', {lng}),
    body: i18n.t('smartNotifTravelBody', {
      lng,
      count: nearbyDishNames.length,
      distance: radiusKm,
      dishes: nearbyDishNames.slice(0, 3).join(' · '),
      area:
        locationContext.city ||
        locationContext.region ||
        locationContext.country ||
        '',
    }),
    data: {
      tastepilotRoute: 'TravelFood',
      nearby: 'true',
    },
    android: {
      channelId: TRAVEL_CHANNEL_ID,
      pressAction: {id: 'default'},
    },
    ios: {
      sound: 'default',
    },
  });

  await writeTimestamp(NEARBY_LAST_ALERT_KEY, now);
  return {shown: true, dishes: nearbyDishNames.slice(0, 3)};
}
