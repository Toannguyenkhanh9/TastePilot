import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MONETIZATION_CONFIG,
  isFreeLaunchMode,
} from '../config/monetizationConfig';

export type MeteredFeature = 'surprise' | 'daily' | 'travel';

const USAGE_PREFIX = '@tastepilot/usage';
const BONUS_PREFIX = '@tastepilot/usage-bonus';

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function baseLimit(feature: MeteredFeature) {
  if (feature === 'surprise') return MONETIZATION_CONFIG.freeTier.surpriseMePerDay;
  if (feature === 'travel') return MONETIZATION_CONFIG.freeTier.travelFoodPerDay;
  return MONETIZATION_CONFIG.freeTier.dailyMealPerDay;
}

function usageKey(feature: MeteredFeature) {
  return `${USAGE_PREFIX}:${feature}:${dayKey()}`;
}

function bonusKey(feature: MeteredFeature) {
  return `${BONUS_PREFIX}:${feature}:${dayKey()}`;
}

async function numberValue(key: string) {
  const raw = await AsyncStorage.getItem(key);
  const value = Number(raw || 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export async function checkFeatureAccess(
  feature: MeteredFeature,
  isPremium: boolean,
) {
  if (isFreeLaunchMode() || isPremium) {
    return {allowed: true, needsRewarded: false, remaining: Number.POSITIVE_INFINITY};
  }

  const [used, bonus] = await Promise.all([
    numberValue(usageKey(feature)),
    numberValue(bonusKey(feature)),
  ]);
  const limit = baseLimit(feature) + bonus;
  return {
    allowed: used < limit,
    needsRewarded: used >= limit,
    remaining: Math.max(0, limit - used),
  };
}

/** Mark a successful completed recommendation use. Failed network/location attempts do not consume quota. */
export async function markFeatureUsed(
  feature: MeteredFeature,
  isPremium: boolean,
) {
  if (isFreeLaunchMode() || isPremium) return;
  const key = usageKey(feature);
  const used = await numberValue(key);
  await AsyncStorage.setItem(key, String(used + 1));
}

/** A completed rewarded ad adds exactly one extra successful use for this feature. */
export async function grantRewardedFeatureUnlock(feature: MeteredFeature) {
  const key = bonusKey(feature);
  const current = await numberValue(key);
  await AsyncStorage.setItem(key, String(current + 1));
  return current + 1;
}

// Backward-compatible helpers used by Stage 9.1 Surprise Me code paths.
export async function consumeSurpriseDecision(isPremium: boolean) {
  const access = await checkFeatureAccess('surprise', isPremium);
  if (access.allowed) await markFeatureUsed('surprise', isPremium);
  return access;
}

export async function grantRewardedSurpriseUnlock() {
  return grantRewardedFeatureUnlock('surprise');
}

export function groupMemberLimit(isPremium: boolean) {
  if (isFreeLaunchMode() || isPremium) return 8;
  return MONETIZATION_CONFIG.freeTier.groupMaxMembers;
}

export function canUseSevenDinnerPlanner(isPremium: boolean) {
  if (isFreeLaunchMode() || isPremium) return true;
  return !MONETIZATION_CONFIG.freeTier.sevenDinnerPlannerRequiresPremium;
}
