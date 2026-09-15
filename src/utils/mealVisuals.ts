import {MealSuggestion} from '../types';

type MealTheme = {
  emoji: string;
  surface: string;
  surfaceStrong: string;
  accent: string;
  accentSoft: string;
  textMuted: string;
};

const THEMES: MealTheme[] = [
  {emoji: '🍜', surface: '#FFF3E8', surfaceStrong: '#FFE1C2', accent: '#D97706', accentSoft: '#FFF0DB', textMuted: '#7C5A2B'},
  {emoji: '🍚', surface: '#EFF8F1', surfaceStrong: '#D7F0DE', accent: '#2F855A', accentSoft: '#E7F8EC', textMuted: '#46624D'},
  {emoji: '🥗', surface: '#EFF7FF', surfaceStrong: '#D8EAFF', accent: '#2B6CB0', accentSoft: '#E6F2FF', textMuted: '#4D6178'},
  {emoji: '🍕', surface: '#FFF0F0', surfaceStrong: '#FFDCDC', accent: '#C05621', accentSoft: '#FFE8E2', textMuted: '#7E5B57'},
  {emoji: '🌮', surface: '#FFF8E6', surfaceStrong: '#FFEAAE', accent: '#B7791F', accentSoft: '#FFF2CB', textMuted: '#7A6030'},
  {emoji: '🍣', surface: '#F4EEFF', surfaceStrong: '#E3D9FF', accent: '#6B46C1', accentSoft: '#EEE7FF', textMuted: '#62577E'},
];

function stableIndex(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % THEMES.length;
}

function cuisineEmoji(cuisine?: string) {
  const value = String(cuisine || '').toLowerCase();
  if (value.includes('vietnam')) return '🥖';
  if (value.includes('japan')) return '🍣';
  if (value.includes('korea')) return '🍚';
  if (value.includes('thai')) return '🍜';
  if (value.includes('ital')) return '🍝';
  if (value.includes('mex')) return '🌮';
  if (value.includes('india')) return '🍛';
  if (value.includes('french')) return '🥐';
  if (value.includes('american')) return '🍔';
  if (value.includes('mediterranean')) return '🥗';
  return '🍽️';
}

export function mealVisuals(meal: Partial<MealSuggestion>) {
  const key = `${meal.cuisine || ''}-${meal.name || ''}`;
  const theme = THEMES[stableIndex(key)];
  return {
    ...theme,
    emoji: meal.visualEmoji || cuisineEmoji(meal.cuisine) || theme.emoji,
    label: meal.localSpecialty ? 'Local pick' : 'Recommended',
  };
}
