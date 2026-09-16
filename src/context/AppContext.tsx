import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {AppState} from 'react-native';
import {LocationContext, MealHistoryItem, Restaurant, UserProfile, WeeklyMealPlan} from '../types';
import {
  DEFAULT_SMART_NOTIFICATION_SETTINGS,
  maybeShowNearbyTravelAlert,
  normalizeSmartNotificationSettings,
  syncSmartMealNotifications,
} from '../services/smartNotificationService';
import i18n, {SUPPORTED_LANGUAGES} from '../i18n';
import {
  migrateProfileRecord,
  runStorageMigrations,
  safeJsonParse,
} from '../services/storageMigrationService';
import {initializePremiumBilling, refreshPremiumStatus, subscribeToPremiumChanges} from '../services/premiumService';
import {initializeAds} from '../services/adService';

const PROFILE_KEY = '@foodpilot/profile';
const HISTORY_KEY = '@foodpilot/history';
const SAVED_KEY = '@foodpilot/saved';
const LOCATION_KEY = '@foodpilot/location-context';
const WEEKLY_PLAN_KEY = '@foodpilot/weekly-plan';

const defaultProfile: UserProfile = {
  currency: 'USD',
  locale: 'en-US',
  defaultBudget: 20,
  preferences: ['Asian', 'Italian'],
  restrictions: [],
  autoCurrency: true,
  allergies: [],
  spicePreference: 'any',
  smartNotifications: DEFAULT_SMART_NOTIFICATION_SETTINGS,
};

function localeToLanguage(locale?: string) {
  const value = String(locale || '').toLowerCase().replace('_', '-');
  const match = SUPPORTED_LANGUAGES.find(item => value.startsWith(item.code));
  return match?.code || 'en';
}

type AppContextValue = {
  profile: UserProfile;
  history: MealHistoryItem[];
  saved: Restaurant[];
  locationContext: LocationContext | null;
  weeklyPlan: WeeklyMealPlan | null;
  hydrated: boolean;
  isPremium: boolean;
  monetizationReady: boolean;
  setProfile: (profile: UserProfile) => void;
  setLocationContext: (value: LocationContext | null) => void;
  addHistory: (item: MealHistoryItem) => void;
  updateHistoryFeedback: (id: string, feedback: MealHistoryItem['feedback']) => void;
  addSaved: (place: Restaurant) => void;
  removeSaved: (id: string) => void;
  setWeeklyPlan: (plan: WeeklyMealPlan | null) => void;
  refreshPremium: () => Promise<boolean>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({children}: {children: React.ReactNode}) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [saved, setSaved] = useState<Restaurant[]>([]);
  const [locationContext, setLocationContextState] = useState<LocationContext | null>(null);
  const [weeklyPlan, setWeeklyPlanState] = useState<WeeklyMealPlan | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isPremium, setIsPremium] = useState(true);
  const [monetizationReady, setMonetizationReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await runStorageMigrations();

        const [p, h, s, l, w] = await Promise.all([
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(LOCATION_KEY),
          AsyncStorage.getItem(WEEKLY_PLAN_KEY),
        ]);

        if (!active) return;

        const storedProfile = safeJsonParse<Partial<UserProfile> | null>(p, null);
        setProfileState({
          ...migrateProfileRecord(storedProfile, defaultProfile),
          smartNotifications: normalizeSmartNotificationSettings(
            storedProfile?.smartNotifications,
          ),
        });

        setHistory(safeJsonParse<MealHistoryItem[]>(h, []).slice(0, 100));
        setSaved(safeJsonParse<Restaurant[]>(s, []).slice(0, 250));
        setLocationContextState(
          safeJsonParse<LocationContext | null>(l, null),
        );
        setWeeklyPlanState(
          safeJsonParse<WeeklyMealPlan | null>(w, null),
        );
      } catch {
        // Startup must continue even if a migration/storage read fails.
      } finally {
        if (active) setHydrated(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage(localeToLanguage(profile.locale)).catch(() => undefined);
  }, [profile.locale]);

  const setProfile = (next: UserProfile) => {
    const normalized = {
      ...defaultProfile,
      ...next,
      smartNotifications: normalizeSmartNotificationSettings(next.smartNotifications),
    };
    setProfileState(normalized);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(normalized)).catch(() => undefined);
  };

  const setLocationContext = (next: LocationContext | null) => {
    setLocationContextState(next);
    if (next) {
      AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(next)).catch(() => undefined);
    } else {
      AsyncStorage.removeItem(LOCATION_KEY).catch(() => undefined);
    }
  };

  const addHistory = (item: MealHistoryItem) => {
    setHistory(prev => {
      const next = [item, ...prev].slice(0, 100);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const updateHistoryFeedback = (id: string, feedback: MealHistoryItem['feedback']) => {
    setHistory(prev => {
      const next = prev.map(item => item.id === id ? {...item, feedback} : item);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const addSaved = (place: Restaurant) => {
    setSaved(prev => {
      const existing = prev.find(x => x.id === place.id);
      if (existing) {
        const next = prev.map(x => x.id === place.id ? {...x, ...place} : x);
        AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => undefined);
        return next;
      }
      const next = [place, ...prev];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const removeSaved = (id: string) => {
    setSaved(prev => {
      const next = prev.filter(x => x.id !== id);
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };


  const setWeeklyPlan = (plan: WeeklyMealPlan | null) => {
    setWeeklyPlanState(plan);
    if (plan) AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(plan)).catch(() => undefined);
    else AsyncStorage.removeItem(WEEKLY_PLAN_KEY).catch(() => undefined);
  };

  const refreshPremium = async () => {
    const status = await refreshPremiumStatus();
    setIsPremium(status.isPremium);
    setMonetizationReady(status.ready);
    if (!status.isPremium) initializeAds(false).catch(() => undefined);
    return status.isPremium;
  };

  useEffect(() => {
    if (!hydrated) return;
    return subscribeToPremiumChanges(value => {
      setIsPremium(value);
      setMonetizationReady(true);
      if (!value) initializeAds(false).catch(() => undefined);
    });
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    initializePremiumBilling()
      .then(status => {
        if (!active) return;
        setIsPremium(status.isPremium);
        setMonetizationReady(status.ready);
        if (!status.isPremium) initializeAds(false).catch(() => undefined);
      })
      .catch(() => {
        if (!active) return;
        setIsPremium(true);
        setMonetizationReady(true);
      });
    return () => { active = false; };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      syncSmartMealNotifications({
        profile,
        history,
        locationContext,
      }).catch(() => undefined);
    }, 700);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    profile.locale,
    profile.preferences,
    profile.restrictions,
    profile.allergies,
    profile.spicePreference,
    profile.smartNotifications,
    history.length,
    locationContext?.city,
    locationContext?.countryCode,
    locationContext?.resolvedAt,
  ]);

  useEffect(() => {
    if (!hydrated) return;

    const runNearbyCheck = () => {
      maybeShowNearbyTravelAlert({
        profile,
        history,
        locationContext,
      }).catch(() => undefined);
    };

    if (AppState.currentState === 'active') runNearbyCheck();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') runNearbyCheck();
    });

    return () => subscription.remove();
  }, [
    hydrated,
    profile.locale,
    profile.preferences,
    profile.restrictions,
    profile.allergies,
    profile.spicePreference,
    profile.smartNotifications,
    history.length,
    locationContext?.countryCode,
    locationContext?.resolvedAt,
  ]);

  const value = useMemo(() => ({
    profile,
    history,
    saved,
    locationContext,
    weeklyPlan,
    hydrated,
    isPremium,
    monetizationReady,
    setProfile,
    setLocationContext,
    addHistory,
    updateHistoryFeedback,
    addSaved,
    removeSaved,
    setWeeklyPlan,
    refreshPremium,
  }), [profile, history, saved, locationContext, weeklyPlan, hydrated, isPremium, monetizationReady]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
