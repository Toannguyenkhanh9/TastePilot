import {MealSuggestion} from '../types';
import {
  getDishNameAliases,
  localizeCuisine,
  localizeDishName,
} from './dishLocalizationService';

export type SearchCatalogDish = {
  id: string;
  familyId: string;
  baseName: string;
  cuisine: string;
  countryCodes: string[];
  imageKey: string;
  tags: string[];
  category: 'main' | 'veg' | 'snack' | 'dessert';
  priceBand: 1 | 2 | 3 | 4;
  searchKeyword: string;
};

const CATALOG = require('../data/dishes1500_global.json') as SearchCatalogDish[];
const BY_ID = new Map(CATALOG.map(dish => [dish.id, dish] as const));

function normalize(value?: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0e00-\u0e7f\u0600-\u06ff\u0900-\u097f]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const ALIASES = CATALOG.map(dish => {
  const values = new Set<string>([
    dish.baseName,
    dish.searchKeyword,
    dish.cuisine,
    ...(dish.tags || []),
    ...getDishNameAliases(dish.id),
  ]);
  const normalized = [...values].map(normalize).filter(Boolean);
  return {dish, normalized};
});

const EXACT_ALIAS = new Map<string, SearchCatalogDish>();
for (const entry of ALIASES) {
  for (const alias of entry.normalized) {
    if (!EXACT_ALIAS.has(alias)) EXACT_ALIAS.set(alias, entry.dish);
  }
}

function tokenScore(query: string, alias: string) {
  if (!query || !alias) return 0;
  if (query === alias) return 1000;
  if (alias.startsWith(query) || query.startsWith(alias)) return 820 - Math.abs(alias.length - query.length);
  if (alias.includes(query) || query.includes(alias)) return 760 - Math.abs(alias.length - query.length);

  const qTokens = query.split(' ').filter(Boolean);
  const aTokens = new Set(alias.split(' ').filter(Boolean));
  if (!qTokens.length) return 0;
  const matched = qTokens.filter(token => aTokens.has(token)).length;
  const ratio = matched / qTokens.length;
  if (matched >= 2 && ratio >= 0.66) return 620 + Math.round(ratio * 100);
  if (matched === 1 && qTokens.length === 1 && query.length >= 4) return 560;
  return 0;
}

function scoreDish(query: string, entry: (typeof ALIASES)[number]) {
  let best = 0;
  for (const alias of entry.normalized) best = Math.max(best, tokenScore(query, alias));
  return best;
}

export function searchCatalogDishes(
  query: string,
  locale?: string,
  limit = 24,
): SearchCatalogDish[] {
  const q = normalize(query);
  if (!q) return [];

  const ranked = ALIASES
    .map(entry => ({dish: entry.dish, score: scoreDish(q, entry)}))
    .filter(item => item.score >= 520)
    .sort((a, b) => b.score - a.score || b.dish.baseName.localeCompare(a.dish.baseName))
    .slice(0, limit)
    .map(item => item.dish);

  // Favor the exact localized/canonical label for the current UI language when present.
  return [...ranked].sort((a, b) => {
    const aName = normalize(localizeDishName(a.id, a.baseName, locale));
    const bName = normalize(localizeDishName(b.id, b.baseName, locale));
    return Number(bName === q) - Number(aName === q);
  });
}

export function catalogDishToMealSuggestion(
  dish: SearchCatalogDish,
  locale?: string,
): MealSuggestion {
  return {
    id: `search:${dish.id}`,
    canonicalId: dish.id,
    familyId: dish.familyId,
    name: localizeDishName(dish.id, dish.baseName, locale),
    cuisine: localizeCuisine(dish.cuisine, locale),
    canonicalName: dish.baseName,
    canonicalCuisine: dish.cuisine,
    estimatedMin: 0,
    estimatedMax: 0,
    reason: '',
    searchKeyword: dish.searchKeyword || dish.baseName,
    imageKey: dish.imageKey,
    recommendationSource: 'local',
    priceTier: dish.priceBand,
  };
}

export function buildFreeTextSearchMeal(query: string): MealSuggestion {
  const clean = String(query || '').trim();
  return {
    id: `search:free:${normalize(clean).replace(/\s+/g, '_')}`,
    name: clean,
    cuisine: '',
    estimatedMin: 0,
    estimatedMax: 0,
    reason: '',
    searchKeyword: clean,
    recommendationSource: 'local',
  };
}

export function findCatalogDishForMeal(
  meal?: Partial<MealSuggestion> | null,
): SearchCatalogDish | undefined {
  if (!meal) return undefined;

  const canonicalId = String(meal.canonicalId || '').trim();
  if (canonicalId && BY_ID.has(canonicalId)) return BY_ID.get(canonicalId);

  const queryCandidates = [meal.name, meal.canonicalName, meal.searchKeyword]
    .map(normalize)
    .filter(Boolean);

  for (const query of queryCandidates) {
    const exact = EXACT_ALIAS.get(query);
    if (exact) return exact;
  }

  let best: {dish: SearchCatalogDish; score: number} | undefined;
  for (const query of queryCandidates) {
    for (const entry of ALIASES) {
      const score = scoreDish(query, entry);
      if (!best || score > best.score) best = {dish: entry.dish, score};
    }
  }

  // A high threshold is intentional: a wrong exact-looking icon is worse than a generic fallback.
  return best && best.score >= 700 ? best.dish : undefined;
}

export function enrichMealWithCatalogIdentity(
  meal: MealSuggestion,
  locale?: string,
): MealSuggestion {
  const dish = findCatalogDishForMeal(meal);
  if (!dish) return meal;

  return {
    ...meal,
    canonicalId: dish.id,
    familyId: dish.familyId,
    name: localizeDishName(dish.id, dish.baseName, locale),
    cuisine: localizeCuisine(dish.cuisine, locale),
    canonicalName: dish.baseName,
    canonicalCuisine: dish.cuisine,
    searchKeyword: dish.searchKeyword || meal.searchKeyword,
    imageKey: dish.imageKey,
    priceTier: dish.priceBand,
  };
}

export function getCatalogDishById(id?: string) {
  return id ? BY_ID.get(id) : undefined;
}
