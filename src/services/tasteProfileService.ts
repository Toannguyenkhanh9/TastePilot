import {
  MealHistoryItem,
  MealSuggestion,
  SpicePreference,
  UserProfile,
} from '../types';

export type LearnedTasteModel = {
  historyCount: number;
  feedbackCount: number;
  positiveCount: number;
  negativeCount: number;
  confidence: number;
  cuisineScores: Record<string, number>;
  familyScores: Record<string, number>;
  topCuisines: string[];
};

type TasteCandidate = {
  cuisine: string;
  familyId?: string;
  baseName?: string;
  tags?: string[];
  spicyLevel?: number;
};

function normalize(value?: string) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function buildTasteProfile(history: MealHistoryItem[]): LearnedTasteModel {
  const cuisineScores: Record<string, number> = {};
  const cuisineLabels: Record<string, string> = {};
  const familyScores: Record<string, number> = {};
  let feedbackCount = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  history.slice(0, 100).forEach((item, index) => {
    const decay = 1 / (1 + index * 0.055);
    const canonicalCuisine = item.mealSnapshot?.canonicalCuisine || item.cuisine || '';
    const cuisineKey = normalize(canonicalCuisine);
    const familyKey = normalize(
      item.mealSnapshot?.familyId ||
      item.mealSnapshot?.canonicalName ||
      item.dishName,
    );

    // Choosing a meal is a weak positive signal even without explicit feedback.
    let signal = 0.55;
    if (item.feedback === 'love') {
      signal = 4.0;
      feedbackCount += 1;
      positiveCount += 1;
    } else if (item.feedback === 'ok') {
      signal = 1.2;
      feedbackCount += 1;
      positiveCount += 1;
    } else if (item.feedback === 'dislike') {
      signal = -5.0;
      feedbackCount += 1;
      negativeCount += 1;
    }

    if (cuisineKey) {
      cuisineScores[cuisineKey] = (cuisineScores[cuisineKey] || 0) + signal * decay;
      cuisineLabels[cuisineKey] = canonicalCuisine;
    }
    if (familyKey) {
      familyScores[familyKey] = (familyScores[familyKey] || 0) + signal * decay;
    }
  });

  const topCuisines = Object.entries(cuisineScores)
    .filter(([, score]) => score > 0.4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => cuisineLabels[key] || key);

  const historyCount = history.length;
  const confidence = clamp(
    (Math.min(historyCount, 20) / 20) * 0.5 +
    (Math.min(feedbackCount, 12) / 12) * 0.5,
    0,
    1,
  );

  return {
    historyCount,
    feedbackCount,
    positiveCount,
    negativeCount,
    confidence,
    cuisineScores,
    familyScores,
    topCuisines,
  };
}

function spiceAdjustment(
  spicyLevel: number | undefined,
  preference: SpicePreference | undefined,
) {
  const level = Number(spicyLevel || 0);
  switch (preference || 'any') {
    case 'mild':
      if (level <= 1) return 5;
      if (level >= 3) return -10;
      return -2;
    case 'medium':
      if (level === 2) return 6;
      if (level === 1) return 2;
      return level >= 3 ? -2 : 0;
    case 'spicy':
      if (level >= 3) return 8;
      if (level === 2) return 5;
      return -3;
    default:
      return 0;
  }
}

export function tasteMatchForDish(
  candidate: TasteCandidate,
  model: LearnedTasteModel,
  profile: UserProfile,
  sessionPreferences: string[] = [],
) {
  const cuisine = normalize(candidate.cuisine);
  const family = normalize(candidate.familyId || candidate.baseName);
  const tags = (candidate.tags || []).map(normalize);

  let score = 72;

  const cuisineSignal = model.cuisineScores[cuisine] || 0;
  const familySignal = model.familyScores[family] || 0;
  score += clamp(cuisineSignal, -6, 8) * (1.8 + model.confidence * 1.2);
  score += clamp(familySignal, -5, 5) * (1.2 + model.confidence * 0.8);

  const combinedPreferences = [
    ...(profile.preferences || []),
    ...(sessionPreferences || []),
  ].map(normalize);

  for (const pref of combinedPreferences) {
    if (!pref) continue;
    if (cuisine.includes(pref) || pref.includes(cuisine)) score += 5;
    if (tags.some(tag => tag.includes(pref) || pref.includes(tag))) score += 4;
    if (pref.includes('healthy') && tags.includes('healthy')) score += 3;
    if (pref.includes('vegetarian') && tags.includes('vegetarian')) score += 5;
  }

  score += spiceAdjustment(candidate.spicyLevel, profile.spicePreference);

  // Low-data users still see useful percentages, but confidence grows over time.
  const lowDataCeiling = model.historyCount < 3 ? 90 : 98;
  return Math.round(clamp(score, 45, lowDataCeiling));
}

export function tasteMatchForSuggestion(
  suggestion: MealSuggestion,
  history: MealHistoryItem[],
  profile: UserProfile,
  sessionPreferences: string[] = [],
) {
  const model = buildTasteProfile(history);
  return tasteMatchForDish(
    {
      cuisine: suggestion.canonicalCuisine || suggestion.cuisine,
      familyId: suggestion.familyId || suggestion.canonicalName || suggestion.name,
      baseName: suggestion.canonicalName || suggestion.name,
      tags: [],
      spicyLevel: undefined,
    },
    model,
    profile,
    sessionPreferences,
  );
}
