import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {useApp} from '../context/AppContext';
import {bannerUnitId, shouldUseAds} from '../services/adService';

export function MonetizationBanner() {
  const {isPremium} = useApp();
  if (!shouldUseAds(isPremium)) return null;
  const unitId = bannerUnitId();
  if (!unitId) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{requestNonPersonalizedAdsOnly: true}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e7e7',
    paddingTop: 2,
    paddingBottom: 2,
  },
});
