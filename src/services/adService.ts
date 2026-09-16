import {Platform} from 'react-native';
import mobileAds, {AdEventType, RewardedAd, RewardedAdEventType, TestIds} from 'react-native-google-mobile-ads';
import {
  MONETIZATION_CONFIG,
  isAdUnitConfigured,
  isFreeLaunchMode,
} from '../config/monetizationConfig';

let initialized = false;

export function shouldUseAds(isPremium: boolean) {
  if (isFreeLaunchMode() || isPremium) return false;
  if (!MONETIZATION_CONFIG.ads.enabledWhenMonetized) return false;
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function initializeAds(isPremium: boolean) {
  if (!shouldUseAds(isPremium) || initialized) return;
  await mobileAds().initialize();
  initialized = true;
}

export function bannerUnitId() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) return TestIds.BANNER;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return '';
  return isAdUnitConfigured(Platform.OS, 'banner')
    ? MONETIZATION_CONFIG.ads.banner[Platform.OS]
    : '';
}

function rewardedUnitId() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) return TestIds.REWARDED;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return '';
  return isAdUnitConfigured(Platform.OS, 'rewarded')
    ? MONETIZATION_CONFIG.ads.rewarded[Platform.OS]
    : '';
}

export async function showRewardedUnlock(isPremium: boolean) {
  if (!shouldUseAds(isPremium)) return false;
  await initializeAds(isPremium);
  const unitId = rewardedUnitId();
  if (!unitId) return false;

  return new Promise<boolean>(resolve => {
    const rewarded = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    let earned = false;
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      unsubLoaded(); unsubEarned(); unsubClosed(); unsubError();
      resolve(value);
    };

    const unsubLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => rewarded.show().catch(() => finish(false)),
    );
    const unsubEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => { earned = true; },
    );
    const unsubClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => finish(earned),
    );
    const unsubError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      () => finish(false),
    );

    rewarded.load();
    setTimeout(() => finish(false), 15000);
  });
}
