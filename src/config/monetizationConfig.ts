export type MonetizationMode = 'free_launch' | 'monetized';

/**
 * MAIN SWITCH
 *
 * free_launch:
 * - every feature unlocked
 * - no quota
 * - no ad request
 * - no paywall
 *
 * monetized:
 * - entitlement comes directly from Apple App Store / Google Play Billing
 * - direct Apple/Google store billing
 * - free users get 1 Surprise Me, 1 Daily Meal and 1 Travel Food use per local day
 * - each later use can be unlocked one-at-a-time with a completed rewarded ad
 */
export const MONETIZATION_MODE: MonetizationMode = 'monetized';

export const MONETIZATION_CONFIG = {
  iap: {
    ios: {
      monthly: 'com.tastepilot.premium.monthly',
      yearly: 'com.tastepilot.premium.yearly',
      lifetime: 'com.tastepilot.premium.lifetime',
    },
    android: {
      monthly: 'tastepilot_premium_monthly',
      yearly: 'tastepilot_premium_yearly',
      lifetime: 'tastepilot_premium_lifetime',
    },
  },

  freeTier: {
    surpriseMePerDay: 1,
    dailyMealPerDay: 1,
    travelFoodPerDay: 1,
    groupMaxMembers: 3,
    sevenDinnerPlannerRequiresPremium: true,
  },

  ads: {
    enabledWhenMonetized: true,
    banner: {
      ios: 'REPLACE_WITH_ADMOB_IOS_BANNER_UNIT_ID',
      android: 'ca-app-pub-6025850831913874/9874966452',
    },
    rewarded: {
      ios: 'REPLACE_WITH_ADMOB_IOS_REWARDED_UNIT_ID',
      android: 'ca-app-pub-6025850831913874/7180606077',
    },
  },
} as const;

function configured(value: string) {
  return !!value && !value.startsWith('REPLACE_WITH_');
}

export function isFreeLaunchMode() {
  return MONETIZATION_MODE === 'free_launch';
}

export function storeProductIds(platform: 'ios' | 'android') {
  const values = MONETIZATION_CONFIG.iap[platform];
  return {
    monthly: values.monthly,
    yearly: values.yearly,
    lifetime: values.lifetime,
    subscriptionIds: [values.monthly, values.yearly].filter(Boolean),
    nonConsumableIds: [values.lifetime].filter(Boolean),
    all: [values.monthly, values.yearly, values.lifetime].filter(Boolean),
  };
}

export function isAdUnitConfigured(
  platform: 'ios' | 'android',
  type: 'banner' | 'rewarded',
) {
  return configured(MONETIZATION_CONFIG.ads[type][platform]);
}
