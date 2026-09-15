import {MealSuggestion} from '../types';

export type FoodTheme = {
  emoji: string;
  surface: string;
  surfaceStrong: string;
  accent: string;
  accentSoft: string;
  textMuted: string;
  heroPhoto: string;
  restaurantPhoto: string;
  chipLabel: string;
};

export type BannerConfig = {
  imageUrl: string;
  accent: string;
  accentSoft: string;
};

export const APP_BANNERS: Record<'home' | 'daily' | 'travel' | 'resultsDaily' | 'resultsTravel', BannerConfig> = {
  home: {
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    accent: '#d97706',
    accentSoft: '#fff4df',
  },
  daily: {
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    accent: '#b45309',
    accentSoft: '#fff0de',
  },
  travel: {
    imageUrl: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1600&q=80',
    accent: '#2563eb',
    accentSoft: '#eef4ff',
  },
  resultsDaily: {
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
    accent: '#ca8a04',
    accentSoft: '#fff9db',
  },
  resultsTravel: {
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80',
    accent: '#2563eb',
    accentSoft: '#edf3ff',
  },
};

const THEMES: FoodTheme[] = [
  {
    emoji: '🍜',
    surface: '#FFF4EA',
    surfaceStrong: '#FFE2C8',
    accent: '#D97706',
    accentSoft: '#FFF1DE',
    textMuted: '#7B5A30',
    heroPhoto: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80',
    restaurantPhoto: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    chipLabel: 'Comfort food',
  },
  {
    emoji: '🍣',
    surface: '#EFF5FF',
    surfaceStrong: '#D7E7FF',
    accent: '#2563EB',
    accentSoft: '#EAF2FF',
    textMuted: '#45607D',
    heroPhoto: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    restaurantPhoto: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
    chipLabel: 'Fresh pick',
  },
  {
    emoji: '🥗',
    surface: '#EEF8F0',
    surfaceStrong: '#D6EEDB',
    accent: '#2F855A',
    accentSoft: '#E8F8ED',
    textMuted: '#46624D',
    heroPhoto: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
    restaurantPhoto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    chipLabel: 'Fresh choice',
  },
  {
    emoji: '🌮',
    surface: '#FFF8E7',
    surfaceStrong: '#FFE9B3',
    accent: '#B7791F',
    accentSoft: '#FFF3CF',
    textMuted: '#7A6030',
    heroPhoto: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80',
    restaurantPhoto: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=1200&q=80',
    chipLabel: 'Street favorite',
  },
  {
    emoji: '🍛',
    surface: '#FFF1ED',
    surfaceStrong: '#FFDCD2',
    accent: '#C05621',
    accentSoft: '#FFEAE3',
    textMuted: '#7E5B57',
    heroPhoto: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
    restaurantPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    chipLabel: 'Flavor-rich',
  },
  {
    emoji: '🍕',
    surface: '#FFF0F2',
    surfaceStrong: '#FFD9DE',
    accent: '#DB2777',
    accentSoft: '#FFE8F1',
    textMuted: '#815768',
    heroPhoto: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    restaurantPhoto: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    chipLabel: 'Popular pick',
  },
];

const KEYWORD_MAP: {keywords: string[]; theme: Partial<FoodTheme>}[] = [
  {keywords: ['pho', 'ramen', 'udon', 'noodle', 'bún', 'bun bo'], theme: {emoji: '🍜', chipLabel: 'Noodle favorite'}},
  {keywords: ['sushi', 'sashimi'], theme: {emoji: '🍣', chipLabel: 'Fresh favorite'}},
  {keywords: ['banh mi', 'bánh mì'], theme: {emoji: '🥖', chipLabel: 'Street favorite'}},
  {keywords: ['com tam', 'cơm tấm', 'bibimbap', 'rice'], theme: {emoji: '🍚', chipLabel: 'Rice bowl'}},
  {keywords: ['salad', 'healthy', 'mediterranean'], theme: {emoji: '🥗', chipLabel: 'Healthy choice'}},
  {keywords: ['taco', 'burrito'], theme: {emoji: '🌮', chipLabel: 'Street favorite'}},
  {keywords: ['pizza'], theme: {emoji: '🍕', chipLabel: 'Cheesy favorite'}},
  {keywords: ['burger'], theme: {emoji: '🍔', chipLabel: 'Classic comfort'}},
  {keywords: ['curry'], theme: {emoji: '🍛', chipLabel: 'Flavor-rich'}},
  {keywords: ['takoyaki', 'snack'], theme: {emoji: '🐙', chipLabel: 'Local snack'}},
  {keywords: ['okonomiyaki', 'pancake'], theme: {emoji: '🥞', chipLabel: 'Local specialty'}},
  {keywords: ['kushikatsu', 'kebab', 'skewer'], theme: {emoji: '🍢', chipLabel: 'Street specialty'}},
  {keywords: ['dessert', 'cake', 'ice cream'], theme: {emoji: '🍰', chipLabel: 'Sweet bite'}},
  {keywords: ['coffee', 'cafe'], theme: {emoji: '☕', chipLabel: 'Coffee stop'}},
];

function stableIndex(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % THEMES.length;
}

export function getMealTheme(meal?: Partial<MealSuggestion>): FoodTheme {
  const key = `${meal?.cuisine || ''}-${meal?.name || ''}`.toLowerCase();
  const base = {...THEMES[stableIndex(key)]};

  for (const item of KEYWORD_MAP) {
    if (item.keywords.some(keyword => key.includes(keyword.toLowerCase()))) {
      return {...base, ...item.theme};
    }
  }

  if (meal?.cuisine) {
    const cuisine = meal.cuisine.toLowerCase();
    if (cuisine.includes('vietnam')) return {...base, emoji: '🥖', chipLabel: 'Local comfort'};
    if (cuisine.includes('japan')) return {...base, emoji: '🍣', chipLabel: 'Japanese pick'};
    if (cuisine.includes('korea')) return {...base, emoji: '🍚', chipLabel: 'Korean favorite'};
    if (cuisine.includes('thai')) return {...base, emoji: '🍜', chipLabel: 'Thai favorite'};
    if (cuisine.includes('mediterranean')) return {...base, emoji: '🥗', chipLabel: 'Fresh choice'};
    if (cuisine.includes('mex')) return {...base, emoji: '🌮', chipLabel: 'Mexican pick'};
    if (cuisine.includes('ital')) return {...base, emoji: '🍝', chipLabel: 'Italian pick'};
  }

  return base;
}
