import AsyncStorage from '@react-native-async-storage/async-storage';
import {USE_MOCK_API} from './config';
import {postJson} from './apiClient';
import {restaurantsMock} from './mockData';
import {getLocalRecommendations} from './localRecommendationService';
import {tasteMatchForSuggestion} from './tasteProfileService';
import {rankRestaurantsForMeal} from './restaurantRankingService';
import {enrichMealWithCatalogIdentity} from './foodSearchService';
import {
  Coordinates,
  LocationContext,
  MealHistoryItem,
  MealSuggestion,
  MealType,
  TravelGuideCategory,
  MoodKey,
  Restaurant,
  UserProfile,
} from '../types';

const AI_CACHE_PREFIX = '@tastepilot/ai-reco/v2';
const AI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const RESTAURANT_CACHE_TTL_MS = 10 * 60 * 1000;
const RESTAURANT_CACHE_MAX = 40;
const restaurantCache = new Map<
  string,
  {createdAt: number; items: Restaurant[]}
>();

function restaurantCacheKey(
  meal: MealSuggestion,
  location?: Coordinates,
  destination?: string,
) {
  const lat =
    location?.latitude != null
      ? Math.round(location.latitude * 1000) / 1000
      : '';
  const lng =
    location?.longitude != null
      ? Math.round(location.longitude * 1000) / 1000
      : '';
  return [
    meal.canonicalId || meal.searchKeyword || meal.name,
    lat,
    lng,
    destination || '',
  ].join('|');
}

function getRestaurantCache(key: string) {
  const cached = restaurantCache.get(key);
  if (!cached) return undefined;
  if (Date.now() - cached.createdAt > RESTAURANT_CACHE_TTL_MS) {
    restaurantCache.delete(key);
    return undefined;
  }
  return cached.items;
}

function setRestaurantCache(key: string, items: Restaurant[]) {
  if (restaurantCache.size >= RESTAURANT_CACHE_MAX) {
    const oldest = restaurantCache.keys().next().value;
    if (oldest) restaurantCache.delete(oldest);
  }
  restaurantCache.set(key, {createdAt: Date.now(), items});
}


type DailyRequest = {
  budget?: number;
  preferences: string[];
  location?: Coordinates;
  locationContext?: LocationContext;
  history: MealHistoryItem[];
  profile: UserProfile;
  excludeDishNames?: string[];
  excludeDishIds?: string[];
  excludeFamilyIds?: string[];
  mealType?: MealType;
  mood?: MoodKey;
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
  excludeDishIds?: string[];
  excludeFamilyIds?: string[];
  mealType?: MealType;
  travelCategory?: TravelGuideCategory;
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


function normalizeIdentity(value?: string) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function filterExcludedSuggestions(
  items: MealSuggestion[],
  input: DailyRequest | TravelRequest,
) {
  const names = (input.excludeDishNames || []).map(normalizeIdentity).filter(Boolean);
  const ids = new Set((input.excludeDishIds || []).map(x => String(x || '').trim()).filter(Boolean));
  const families = new Set((input.excludeFamilyIds || []).map(x => String(x || '').trim()).filter(Boolean));

  return items.filter(item => {
    const canonicalId = String(item.canonicalId || '').trim();
    const familyId = String(item.familyId || '').trim();
    if (canonicalId && ids.has(canonicalId)) return false;
    if (familyId && families.has(familyId)) return false;

    const itemNames = [item.canonicalName, item.name].map(normalizeIdentity).filter(Boolean);
    return !names.some(excluded =>
      itemNames.some(name => name === excluded || name.includes(excluded) || excluded.includes(name)),
    );
  });
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
    allergies: [...(input.profile.allergies || [])].sort(),
    spicePreference: input.profile.spicePreference || 'any',
    destination: 'destination' in input ? input.destination || '' : '',
    mealType: input.mealType || 'lunch',
    mood: 'mood' in input ? input.mood || '' : '',
    travelCategory: 'travelCategory' in input ? input.travelCategory || 'must_try' : '',
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

function markAI(
  items: MealSuggestion[],
  input?: DailyRequest | TravelRequest,
) {
  return items.map(rawItem => {
    // If Gemini names a dish that already exists in the bundled catalog, restore
    // its canonical identity before the UI sees it. This keeps exact food icons,
    // localized display names and Google Places search keywords in sync.
    const item = enrichMealWithCatalogIdentity(rawItem, input?.profile?.locale);
    return {
      ...item,
      recommendationSource: 'ai' as const,
      priceEstimateSource: item.priceEstimateSource || 'ai' as const,
      priceConfidence: item.priceConfidence || 'low' as const,
      tasteMatchPercent: input
        ? tasteMatchForSuggestion(
            item,
            'history' in input ? input.history || [] : [],
            input.profile,
            'preferences' in input ? input.preferences || [] : [],
          )
        : item.tasteMatchPercent,
      allergyFilterApplied: !!input?.profile?.allergies?.length,
      travelCategory:
        input && 'travelCategory' in input ? input.travelCategory : item.travelCategory,
      mood: input && 'mood' in input ? input.mood : item.mood,
    };
  });
}

async function fetchAI(
  mode: 'daily' | 'travel',
  input: DailyRequest | TravelRequest,
): Promise<MealSuggestion[]> {
  const key = makeCacheKey(mode, input);
  const cached = await readAICache(key);
  if (cached?.length) {
    const filteredCached = filterByBudgetWindow(filterExcludedSuggestions(markAI(cached, input), input), input.budget);
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
  return filterExcludedSuggestions(markAI(suggestions, input), input);
}

function mergeLocalAndAI(local: MealSuggestion[], ai: MealSuggestion[], budget?: number, limit = 5) {
  const blockedFamilies = new Set(local.map(x => x.familyId).filter(Boolean));
  const aiFiltered = ai.filter(x => !x.familyId || !blockedFamilies.has(x.familyId));
  return filterByBudgetWindow(uniqueByName([...local, ...aiFiltered]), budget).slice(0, limit);
}

/**
 * Local-first recommendation strategy:
 * 1) Rank the bundled 1,050-dish catalog locally.
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
    mood: input.mood,
    excludeDishNames: input.excludeDishNames,
    excludeDishIds: input.excludeDishIds,
    excludeFamilyIds: input.excludeFamilyIds,
    limit: 5,
  });

  if (!input.forceAI && local.length >= 5) return local;
  if (!input.forceAI && (input.profile.allergies || []).length > 0) return local;
  if (USE_MOCK_API && !input.forceAI) return local;

  try {
    const ai = await fetchAI('daily', input);
    return filterExcludedSuggestions(mergeLocalAndAI(local, ai, input.budget, 5), input);
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
    travelCategory: input.travelCategory,
    excludeDishNames: input.excludeDishNames,
    excludeDishIds: input.excludeDishIds,
    excludeFamilyIds: input.excludeFamilyIds,
    limit: 5,
  });

  const localSpecialties = local.filter(item => item.localSpecialty);
  if (!input.forceAI && local.length >= 5 && localSpecialties.length >= 5) return local;
  if (!input.forceAI && (input.profile.allergies || []).length > 0) return local;
  if (USE_MOCK_API && !input.forceAI) return local;

  try {
    const ai = await fetchAI('travel', input);
    return filterExcludedSuggestions(mergeLocalAndAI(local, ai, input.budget, 5), input);
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
  const cacheKey = restaurantCacheKey(meal, location, destination);
  const cached = getRestaurantCache(cacheKey);
  if (cached) return cached;

  if (USE_MOCK_API) {
    const ranked = rankRestaurantsForMeal(restaurantsMock.map((r, i) => ({
      ...r,
      id: `${r.id}-${i}`,
      name: `${meal.name} · ${r.name}`,
      latitude: location?.latitude,
      longitude: location?.longitude,
      openNow: i !== 2,
      primaryType: 'restaurant',
    })), meal);
    setRestaurantCache(cacheKey, ranked);
    return ranked;
  }

  // Places is live data, but repeated calls for the same dish/current area are
  // cached briefly to protect quota and make back-navigation instant.
  const data = await postJson<{restaurants: Restaurant[]}>('searchRestaurants', {
    keyword: meal.searchKeyword,
    location,
    destination,
  });
  const ranked = rankRestaurantsForMeal(data.restaurants || [], meal);
  setRestaurantCache(cacheKey, ranked);
  return ranked;
}
