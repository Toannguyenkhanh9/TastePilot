import {MealType, MealTypeSelection} from '../types';

export function getCurrentMealType(now = new Date()): MealType {
  const hour = now.getHours();

  // Device-local time:
  // breakfast 05:00–10:59
  // lunch     11:00–15:59
  // dinner    16:00–04:59
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
}

export function resolveMealType(
  selection: MealTypeSelection,
  now = new Date(),
): MealType {
  return selection === 'auto' ? getCurrentMealType(now) : selection;
}
