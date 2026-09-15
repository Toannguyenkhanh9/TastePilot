import AsyncStorage from '@react-native-async-storage/async-storage';
import {USE_MOCK_API} from './config';
import {postJson} from './apiClient';
import {restaurantsMock} from './mockData';
import {getLocalRecommendations} from './localRecommendationService';
import {
  Coordinates,
  LocationContext,
  MealHistoryItem,
  MealSuggestion,
  MealType,
  Restaurant,
  UserProfile,
} from '../types';

const AI_CACHE_PREFIX = '@tastepilot/ai-reco/v2';
const AI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type DailyRequest = {
  budget?: number;
  preferences: string[];
  location?: Coordinates;
  locationContext?: LocationContext;
  history: MealHistoryItem[];
  profile: UserProfile;
  excludeDishNames?: string[];
  mealType?: MealType;
  forceAI?: boolean;
};

type TravelRequest = {
  budget?: number;
  destination?: string;
  location?: Coordinates;
  locationContext?: LocationContext;
  profile: UserProfile;
  history?: MealHistoryItem[];
  excludeDishNames?: string[];
  mealType?: MealType;
  forceAI?: boolean;
};

type CachedAI = {savedAt: number; suggestions: MealSuggestion[]};

function uniqueByName(items: MealSuggestion[]) {
  const used = new Set<string>();
  return items.filter(item => {
    const key = item.name.trim().toLowerCase();
    if (!key || used.has(key)) return false;
    used.add(key);
    return true;
  });
}

function isInsideBudgetWindow(item: MealSuggestion, budget?: number) {
  if (!budget || budget <= 0) return true;
  const minAllowed = budget * 0.80;
  const maxAllowed = budget * 1.20;
  return Number(item.estimatedMin) >= minAllowed && Number(item.estimatedMax) <= maxAllowed;
}

function filterByBudgetWindow(items: MealSuggestion[], budget?: number) {
  return items.filter(item => isInsideBudgetWindow(item, budget));
}

function simpleHash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function budgetBucket(value?: number) {
  if (!value || value <= 0) return 'none';
  const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(value)) - 1));
  return String(Math.round(value / magnitude) * magnitude);
}

function makeCacheKey(mode: 'daily'|'travel', input: DailyRequest | TravelRequest) {
  const raw = JSON.stringify({
    mode,
    country: input.locationContext?.countryCode || '',
    currency: input.profile.currency,
    locale: input.profile.locale,
    budget: budgetBucket(input.budget),
    preferences: 'preferences' in input ? [...(input.preferences || [])].sort() : [],
    restrictions: [...(input.profile.restrictions || [])].sort(),
    destination: 'destination' in input ? input.destination || '' : '',
    mealType: input.mealType || 'lunch',
  });
  return `${AI_CACHE_PREFIX}:${simpleHash(raw)}`;
}

async function readAICache(key: string): Promise<MealSuggestion[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedAI;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > AI_CACHE_TTL_MS) {
      AsyncStorage.removeItem(key).catch(() => undefined);
      return null;
    }
    return Array.isArray(parsed.suggestions) ? parsed.suggestions : null;
  } catch {
    return null;
  }
}

async function writeAICache(key: string, suggestions: MealSuggestion[]) {
  const payload: CachedAI = {savedAt: Date.now(), suggestions};
  AsyncStorage.setItem(key, JSON.stringify(payload)).catch(() => undefined);
}

function markAI(items: MealSuggestion[]) {
  return items.map(item => ({
    ...item,
    recommendationSource: 'ai' as const,
    priceEstimateSource: item.priceEstimateSource || 'ai' as const,
    priceConfidence: item.priceConfidence || 'low' as const,
  }));
}

async function fetchAI(
  mode: 'daily' | 'travel',
  input: DailyRequest | TravelRequest,
): Promise<MealSuggestion[]> {
  const key = makeCacheKey(mode, input);
  const cached = await readAICache(key);
  if (cached?.length) {
    const filteredCached = filterByBudgetWindow(markAI(cached), input.budget);
    if (filteredCached.length) return filteredCached;
  }

  const data = await postJson<{suggestions: MealSuggestion[]}>('recommendMeals', {
    mode,
    ...input,
  });
  const suggestions = filterByBudgetWindow(
    uniqueByName(data.suggestions || []).slice(0, 10),
    input.budget,
  );
  if (suggestions.length) await writeAICache(key, suggestions);
  return markAI(suggestions);
}

function mergeLocalAndAI(local: MealSuggestion[], ai: MealSuggestion[], budget?: number, limit = 5) {
  const blockedFamilies = new Set(local.map(x => x.familyId).filter(Boolean));
  const aiFiltered = ai.filter(x => !x.familyId || !blockedFamilies.has(x.familyId));
  return filterByBudgetWindow(uniqueByName([...local, ...aiFiltered]), budget).slice(0, limit);
}

/**
 * Local-first recommendation strategy:
 * 1) Rank the bundled 1,000-dish catalog locally.
 * 2) If 5 good local results exist, return immediately: zero Gemini call.
 * 3) Only fall back to Gemini when the local catalog cannot satisfy restrictions,
 *    or when forceAI=true is explicitly requested.
 * 4) Gemini fallback is cached for 24 hours by locale/country/budget/preferences.
 */
export async function getDailyRecommendations(input: DailyRequest): Promise<MealSuggestion[]> {
  const local = getLocalRecommendations({
    mode: 'daily',
    budget: input.budget,
    preferences: input.preferences,
    locationContext: input.locationContext,
    history: input.history,
    profile: input.profile,
    mealType: input.mealType,
    excludeDishNames: input.excludeDishNames,
    limit: 5,
  });

  if (!input.forceAI && local.length >= 5) return local;
  if (USE_MOCK_API && !input.forceAI) return local;

  try {
    const ai = await fetchAI('daily', input);
    return mergeLocalAndAI(local, ai, input.budget, 5);
  } catch (error) {
    if (local.length) return local;
    throw error;
  }
}

export async function getTravelRecommendations(input: TravelRequest): Promise<MealSuggestion[]> {
  const local = getLocalRecommendations({
    mode: 'travel',
    budget: input.budget,
    preferences: input.profile.preferences || [],
    locationContext: input.locationContext,
    history: input.history || [],
    profile: input.profile,
    mealType: input.mealType,
    excludeDishNames: input.excludeDishNames,
    limit: 5,
  });

  const localSpecialties = local.filter(item => item.localSpecialty);
  if (!input.forceAI && local.length >= 5 && localSpecialties.length >= 5) return local;
  if (USE_MOCK_API && !input.forceAI) return local;

  try {
    const ai = await fetchAI('travel', input);
    return mergeLocalAndAI(local, ai, input.budget, 5);
  } catch (error) {
    if (local.length) return local;
    throw error;
  }
}

export async function getRestaurantsForMeal(
  meal: MealSuggestion,
  location?: Coordinates,
  destination?: string,
): Promise<Restaurant[]> {
  if (USE_MOCK_API) {
    return restaurantsMock.map((r, i) => ({
      ...r,
      id: `${r.id}-${i}`,
      name: `${meal.name} · ${r.name}`,
      latitude: location?.latitude,
      longitude: location?.longitude,
      openNow: i !== 2,
      primaryType: 'restaurant',
    }));
  }

  // Places is still used here because restaurant availability/rating/distance is live data.
  // The expensive AI step has already been avoided by the local catalog above.
  const data = await postJson<{restaurants: Restaurant[]}>('searchRestaurants', {
    keyword: meal.searchKeyword,
    location,
    destination,
  });
  return data.restaurants;
}
