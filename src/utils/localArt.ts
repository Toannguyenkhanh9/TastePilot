import {ImageSourcePropType} from 'react-native';
import {MealSuggestion} from '../types';

const FOOD_BACKGROUND = require('../assets/backgrounds/food_soft_background.png');
const DAILY_HERO = require('../assets/backgrounds/hero_daily_multilang_clean.png');
const TRAVEL_HERO = require('../assets/backgrounds/hero_travel_multilang_clean.png');

export type FoodLabelKey =
  | 'noodleFavorite'
  | 'streetFavorite'
  | 'riceFavorite'
  | 'freshPick'
  | 'italianFavorite'
  | 'comfortFood'
  | 'healthyChoice'
  | 'sweetPick'
  | 'chefPick';

export type LocalFoodArt = {
  hero: ImageSourcePropType;
  accent: string;
  accentSoft: string;
  surface: string;
  label: string;
  labelKey: FoodLabelKey;
};


export const BRANDING_ASSETS = {
  onboardingWelcome: FOOD_BACKGROUND,
  onboardingPreferences: DAILY_HERO,
  onboardingBudget: FOOD_BACKGROUND,
  onboardingLocation: TRAVEL_HERO,
} as const;

export const APP_LOCAL_BANNERS = {
  home: FOOD_BACKGROUND,
  daily: DAILY_HERO,
  travel: TRAVEL_HERO,
  history: FOOD_BACKGROUND,
  restaurant: FOOD_BACKGROUND,
  resultsDaily: DAILY_HERO,
  resultsTravel: TRAVEL_HERO,
};

function normalizedText(meal: Partial<MealSuggestion> | undefined) {
  return `${meal?.name || ''} ${meal?.cuisine || ''} ${meal?.searchKeyword || ''}`.toLowerCase();
}

export function getMealLocalArt(meal?: Partial<MealSuggestion>): LocalFoodArt {
  const text = normalizedText(meal);

  if (text.includes('pho') || text.includes('phở') || text.includes('ramen') || text.includes('noodle')) {
    return {hero: DAILY_HERO, accent: '#4e8d6b', accentSoft: '#e9f6ef', surface: '#fbfffc', label: 'Noodle favorite', labelKey: 'noodleFavorite'};
  }
  if (text.includes('banh mi') || text.includes('bánh mì') || text.includes('sandwich')) {
    return {hero: DAILY_HERO, accent: '#e28f2d', accentSoft: '#fff4e4', surface: '#fffdf8', label: 'Street favorite', labelKey: 'streetFavorite'};
  }
  if (text.includes('com tam') || text.includes('cơm tấm') || text.includes('rice')) {
    return {hero: DAILY_HERO, accent: '#8a62d4', accentSoft: '#f0eaff', surface: '#fdfbff', label: 'Rice favorite', labelKey: 'riceFavorite'};
  }
  if (text.includes('sushi') || text.includes('sashimi')) {
    return {hero: TRAVEL_HERO, accent: '#3d6ecf', accentSoft: '#eaf1ff', surface: '#fbfdff', label: 'Fresh pick', labelKey: 'freshPick'};
  }
  if (text.includes('pizza') || text.includes('pasta') || text.includes('spaghetti')) {
    return {hero: DAILY_HERO, accent: '#d96d42', accentSoft: '#fff0ea', surface: '#fffaf8', label: 'Italian favorite', labelKey: 'italianFavorite'};
  }
  if (text.includes('burger')) {
    return {hero: DAILY_HERO, accent: '#c98035', accentSoft: '#fff2e3', surface: '#fffaf5', label: 'Comfort food', labelKey: 'comfortFood'};
  }
  if (text.includes('salad') || text.includes('healthy') || text.includes('vegetarian')) {
    return {hero: DAILY_HERO, accent: '#46a16b', accentSoft: '#eaf7ef', surface: '#fbfffc', label: 'Healthy choice', labelKey: 'healthyChoice'};
  }
  if (text.includes('cake') || text.includes('dessert') || text.includes('sweet')) {
    return {hero: DAILY_HERO, accent: '#dd5a7b', accentSoft: '#ffedf3', surface: '#fffafd', label: 'Sweet pick', labelKey: 'sweetPick'};
  }

  return {hero: DAILY_HERO, accent: '#6e83d6', accentSoft: '#edf1ff', surface: '#fbfcff', label: 'Chef pick', labelKey: 'chefPick'};
}
