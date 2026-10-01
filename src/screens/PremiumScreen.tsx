import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {
  getPremiumPackages,
  isBillingOperational,
  purchasePremiumPackage,
  restorePremiumPurchases,
} from '../services/premiumService';
import {isFreeLaunchMode} from '../config/monetizationConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Premium'>;

export function PremiumScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {isPremium, refreshPremium} = useApp();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (isFreeLaunchMode() || !isBillingOperational()) {
        if (active) setLoading(false);
        return;
      }
      try {
        const available = await getPremiumPackages();
        if (active) setPackages(available);
      } catch {
        if (active) Alert.alert(t('premiumStoreErrorTitle'), t('premiumStoreErrorText'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [t]);

  const buy = async (pkg: any) => {
    setBuying(pkg.identifier || 'package');
    try {
      const result = await purchasePremiumPackage(pkg);
      await refreshPremium();
      if (result.isPremium) {
        Alert.alert(t('premiumThanksTitle'), t('premiumThanksText'), [
          {text: t('common.ok'), onPress: () => navigation.goBack()},
        ]);
      }
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert(t('premiumPurchaseErrorTitle'), t('premiumPurchaseErrorText'));
      }
    } finally {
      setBuying(null);
    }
  };

  const restore = async () => {
    setBuying('restore');
    try {
      const result = await restorePremiumPurchases();
      await refreshPremium();
      Alert.alert(
        result.isPremium ? t('premiumRestoreDoneTitle') : t('premiumRestoreNoneTitle'),
        result.isPremium ? t('premiumRestoreDoneText') : t('premiumRestoreNoneText'),
      );
    } catch {
      Alert.alert(t('premiumPurchaseErrorTitle'), t('premiumPurchaseErrorText'));
    } finally {
      setBuying(null);
    }
  };

  if (isFreeLaunchMode()) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>{t('premiumLaunchEyebrow')}</Text>
        <Text style={styles.title}>{t('premiumLaunchTitle')}</Text>
        <Text style={styles.subtitle}>{t('premiumLaunchText')}</Text>
        <View style={styles.launchCard}>
          <Text style={styles.launchEmoji}>🎁</Text>
          <Text style={styles.launchCardTitle}>{t('premiumLaunchCardTitle')}</Text>
          <Text style={styles.launchCardText}>{t('premiumLaunchCardText')}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>{t('premiumEyebrow')}</Text>
      <Text style={styles.title}>{t('premiumTitle')}</Text>
      <Text style={styles.subtitle}>{t('premiumSubtitle')}</Text>

      <View style={styles.featureCard}>
        <Text style={styles.feature}>✓ {t('premiumFeatureNoAds')}</Text>
        <Text style={styles.feature}>✓ {t('premiumFeatureUnlimitedSurprise')}</Text>
        <Text style={styles.feature}>✓ {t('premiumFeatureGroup')}</Text>
        <Text style={styles.feature}>✓ {t('premiumFeaturePlanner')}</Text>
      </View>

      {isPremium ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>{t('premiumActiveTitle')}</Text>
          <Text style={styles.activeText}>{t('premiumActiveText')}</Text>
        </View>
      ) : null}

      {loading ? <ActivityIndicator style={styles.loader} size="large" color="#d95f38" /> : null}

      {!loading && !isPremium && packages.map(pkg => (
        <Pressable
          key={pkg.identifier}
          style={styles.packageCard}
          onPress={() => buy(pkg)}
          disabled={!!buying}>
          <View style={styles.packageCopy}>
            <Text style={styles.packageTitle}>{pkg.title || pkg.identifier || t('premiumPlan')}</Text>
            <Text style={styles.packageMeta}>{t('premiumCancelAnytime')}</Text>
          </View>
          <Text style={styles.price}>{pkg.priceString || ''}</Text>
        </Pressable>
      ))}

      {!loading && !isPremium && packages.length === 0 ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>{t('premiumNoPackagesTitle')}</Text>
          <Text style={styles.warningText}>{t('premiumNoPackagesText')}</Text>
        </View>
      ) : null}

      {!isPremium ? (
        <Pressable style={styles.restoreButton} onPress={restore} disabled={!!buying}>
          <Text style={styles.restoreText}>{buying === 'restore' ? t('common.loading') : t('premiumRestore')}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.legal}>{t('premiumLegal')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:22,paddingBottom:60,backgroundColor:'#fff9f1',flexGrow:1},
  eyebrow:{fontSize:12,fontWeight:'900',color:'#8a6949',letterSpacing:1.3},
  title:{fontSize:34,lineHeight:40,fontWeight:'900',color:'#171717',marginTop:8},
  subtitle:{fontSize:14,lineHeight:21,color:'#666',marginTop:8},
  featureCard:{backgroundColor:'#fff',borderRadius:24,padding:18,marginTop:18,borderWidth:1,borderColor:'#eadfce'},
  feature:{fontSize:14,lineHeight:24,color:'#333',fontWeight:'800'},
  activeCard:{backgroundColor:'#e9f7ee',borderRadius:20,padding:16,marginTop:14},
  activeTitle:{fontSize:16,fontWeight:'900',color:'#237a43'},
  activeText:{fontSize:13,lineHeight:19,color:'#3d6e4e',marginTop:5},
  loader:{marginTop:26},
  packageCard:{minHeight:76,flexDirection:'row',alignItems:'center',backgroundColor:'#fff',borderRadius:20,padding:16,borderWidth:1,borderColor:'#efd8ca',marginTop:12},
  packageCopy:{flex:1,paddingRight:12},packageTitle:{fontSize:16,fontWeight:'900',color:'#222'},packageMeta:{fontSize:11,color:'#777',marginTop:5},
  price:{fontSize:16,fontWeight:'900',color:'#d95f38'},
  restoreButton:{minHeight:48,borderRadius:16,borderWidth:1,borderColor:'#e7a58e',alignItems:'center',justifyContent:'center',marginTop:16},
  restoreText:{fontSize:13,fontWeight:'900',color:'#d95f38'},
  warningCard:{backgroundColor:'#fff3ee',borderRadius:18,padding:15,marginTop:16},warningTitle:{fontSize:14,fontWeight:'900',color:'#8a4b36'},warningText:{fontSize:12,lineHeight:18,color:'#8a5d4b',marginTop:5},
  legal:{fontSize:10,lineHeight:16,color:'#999',textAlign:'center',marginTop:18},
  launchCard:{backgroundColor:'#eef7ee',borderRadius:26,padding:24,marginTop:22,alignItems:'center'},launchEmoji:{fontSize:48},launchCardTitle:{fontSize:19,fontWeight:'900',color:'#237a43',marginTop:12,textAlign:'center'},launchCardText:{fontSize:13,lineHeight:20,color:'#4d7459',marginTop:8,textAlign:'center'},
});
