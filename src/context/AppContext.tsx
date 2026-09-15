import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {LocationContext, MealHistoryItem, Restaurant, UserProfile} from '../types';
import i18n, {SUPPORTED_LANGUAGES} from '../i18n';

const PROFILE_KEY = '@foodpilot/profile';
const HISTORY_KEY = '@foodpilot/history';
const SAVED_KEY = '@foodpilot/saved';
const LOCATION_KEY = '@foodpilot/location-context';

const defaultProfile: UserProfile = {
  currency: 'USD',
  locale: 'en-US',
  defaultBudget: 20,
  preferences: ['Asian', 'Italian'],
  restrictions: [],
  autoCurrency: true,
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
  setProfile: (profile: UserProfile) => void;
  setLocationContext: (value: LocationContext | null) => void;
  addHistory: (item: MealHistoryItem) => void;
  updateHistoryFeedback: (id: string, feedback: MealHistoryItem['feedback']) => void;
  addSaved: (place: Restaurant) => void;
  removeSaved: (id: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({children}: {children: React.ReactNode}) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [saved, setSaved] = useState<Restaurant[]>([]);
  const [locationContext, setLocationContextState] = useState<LocationContext | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PROFILE_KEY),
      AsyncStorage.getItem(HISTORY_KEY),
      AsyncStorage.getItem(SAVED_KEY),
      AsyncStorage.getItem(LOCATION_KEY),
    ]).then(([p, h, s, l]) => {
      if (p) {
        const stored = JSON.parse(p) as Partial<UserProfile>;
        setProfileState({...defaultProfile, ...stored});
      }
      if (h) setHistory(JSON.parse(h));
      if (s) setSaved(JSON.parse(s));
      if (l) setLocationContextState(JSON.parse(l));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    i18n.changeLanguage(localeToLanguage(profile.locale)).catch(() => undefined);
  }, [profile.locale]);

  const setProfile = (next: UserProfile) => {
    const normalized = {...defaultProfile, ...next};
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

  const value = useMemo(() => ({
    profile,
    history,
    saved,
    locationContext,
    setProfile,
    setLocationContext,
    addHistory,
    updateHistoryFeedback,
    addSaved,
    removeSaved,
  }), [profile, history, saved, locationContext]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
