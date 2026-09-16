import {Platform} from 'react-native';
import * as IAP from 'react-native-iap';
import {
  isFreeLaunchMode,
  storeProductIds,
} from '../config/monetizationConfig';

export type PremiumStatus = {
  ready: boolean;
  isPremium: boolean;
  source:
    | 'free_launch'
    | 'app_store'
    | 'play_store'
    | 'store_not_supported'
    | 'billing_error';
};

export type DirectStorePackage = {
  identifier: string;
  type: 'subscription' | 'lifetime';
  title: string;
  description?: string;
  priceString: string;
  raw: any;
};

let connected = false;
let purchaseUpdateSubscription: {remove?: () => void} | null = null;
let purchaseErrorSubscription: {remove?: () => void} | null = null;
let premiumChangeListeners: Array<(premium: boolean) => void> = [];

function platformStore(): 'ios' | 'android' | null {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return null;
}

function sourceForPlatform(): PremiumStatus['source'] {
  return Platform.OS === 'ios' ? 'app_store' : 'play_store';
}

function api(): any {
  return IAP as any;
}

function productIdOf(purchase: any) {
  return String(
    purchase?.productId ||
    purchase?.productIdentifier ||
    purchase?.sku ||
    '',
  );
}

function isPremiumProduct(productId: string) {
  const platform = platformStore();
  if (!platform) return false;
  return storeProductIds(platform).all.includes(productId);
}

function notifyPremium(value: boolean) {
  premiumChangeListeners.forEach(listener => {
    try { listener(value); } catch {}
  });
}

export function subscribeToPremiumChanges(listener: (premium: boolean) => void) {
  premiumChangeListeners.push(listener);
  return () => {
    premiumChangeListeners = premiumChangeListeners.filter(item => item !== listener);
  };
}

export function isBillingOperational() {
  return !isFreeLaunchMode() && !!platformStore();
}

async function ensureConnection() {
  if (connected) return true;
  const fn = api().initConnection;
  if (typeof fn !== 'function') return false;
  await fn();
  connected = true;

  // Android can leave unfinished cached purchases after a billing interruption.
  if (Platform.OS === 'android' && typeof api().flushFailedPurchasesCachedAsPendingAndroid === 'function') {
    try { await api().flushFailedPurchasesCachedAsPendingAndroid(); } catch {}
  }

  if (!purchaseUpdateSubscription && typeof api().purchaseUpdatedListener === 'function') {
    purchaseUpdateSubscription = api().purchaseUpdatedListener(async (purchase: any) => {
      const productId = productIdOf(purchase);
      if (!isPremiumProduct(productId)) return;
      try {
        if (typeof api().finishTransaction === 'function') {
          await api().finishTransaction({purchase, isConsumable: false});
        }
      } catch {}
      notifyPremium(true);
    });
  }

  if (!purchaseErrorSubscription && typeof api().purchaseErrorListener === 'function') {
    purchaseErrorSubscription = api().purchaseErrorListener(() => undefined);
  }

  return true;
}

async function availablePurchases(suppressErrors = false) {
  await ensureConnection();
  if (typeof api().getAvailablePurchases !== 'function') return [];
  try {
    const result = await api().getAvailablePurchases();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    if (suppressErrors) return [];
    throw error;
  }
}

function hasPremiumPurchase(purchases: any[]) {
  return purchases.some(purchase => isPremiumProduct(productIdOf(purchase)));
}

export async function initializePremiumBilling(): Promise<PremiumStatus> {
  if (isFreeLaunchMode()) {
    return {ready: true, isPremium: true, source: 'free_launch'};
  }
  if (!platformStore()) {
    return {ready: true, isPremium: true, source: 'store_not_supported'};
  }

  try {
    await ensureConnection();
    const purchases = await availablePurchases(false);
    return {
      ready: true,
      isPremium: hasPremiumPurchase(purchases),
      source: sourceForPlatform(),
    };
  } catch {
    // Fail open: a billing outage must never lock core food discovery.
    return {ready: true, isPremium: true, source: 'billing_error'};
  }
}

export async function refreshPremiumStatus(): Promise<PremiumStatus> {
  return initializePremiumBilling();
}

async function getSubscriptionsCompat(skus: string[]) {
  if (!skus.length || typeof api().getSubscriptions !== 'function') return [];
  try {
    const result = await api().getSubscriptions({skus});
    return Array.isArray(result) ? result : [];
  } catch {
    try {
      const result = await api().getSubscriptions(skus);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  }
}

async function getProductsCompat(skus: string[]) {
  if (!skus.length || typeof api().getProducts !== 'function') return [];
  try {
    const result = await api().getProducts({skus});
    return Array.isArray(result) ? result : [];
  } catch {
    try {
      const result = await api().getProducts(skus);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  }
}

function displayPrice(product: any) {
  return String(
    product?.localizedPrice ||
    product?.displayPrice ||
    product?.priceString ||
    product?.oneTimePurchaseOfferDetails?.formattedPrice ||
    product?.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]?.formattedPrice ||
    product?.price ||
    '',
  );
}

function titleOf(product: any, fallback: string) {
  return String(product?.title || product?.name || fallback);
}

export async function getPremiumPackages(): Promise<DirectStorePackage[]> {
  if (!isBillingOperational()) return [];
  const platform = platformStore()!;
  const ids = storeProductIds(platform);
  await ensureConnection();

  const [subscriptions, products] = await Promise.all([
    getSubscriptionsCompat(ids.subscriptionIds),
    getProductsCompat(ids.nonConsumableIds),
  ]);

  const subPackages: DirectStorePackage[] = subscriptions.map((product: any) => ({
    identifier: productIdOf(product),
    type: 'subscription',
    title: titleOf(product, productIdOf(product)),
    description: product?.description,
    priceString: displayPrice(product),
    raw: product,
  }));

  const lifetimePackages: DirectStorePackage[] = products.map((product: any) => ({
    identifier: productIdOf(product),
    type: 'lifetime',
    title: titleOf(product, productIdOf(product)),
    description: product?.description,
    priceString: displayPrice(product),
    raw: product,
  }));

  return [...subPackages, ...lifetimePackages];
}

function androidOfferToken(product: any) {
  const details = product?.subscriptionOfferDetails || product?.subscriptionOfferDetailsAndroid;
  if (!Array.isArray(details) || !details.length) return undefined;
  return details[0]?.offerToken;
}

async function requestSubscriptionCompat(pkg: DirectStorePackage) {
  const fn = api().requestSubscription;
  if (typeof fn !== 'function') throw new Error('requestSubscription unavailable');

  if (Platform.OS === 'android') {
    const offerToken = androidOfferToken(pkg.raw);
    if (offerToken) {
      try {
        return await fn({
          sku: pkg.identifier,
          subscriptionOffers: [{sku: pkg.identifier, offerToken}],
        });
      } catch {}
    }
  }

  try {
    return await fn({sku: pkg.identifier});
  } catch {
    return fn(pkg.identifier);
  }
}

async function requestLifetimeCompat(pkg: DirectStorePackage) {
  const fn = api().requestPurchase;
  if (typeof fn !== 'function') throw new Error('requestPurchase unavailable');
  try {
    return await fn({sku: pkg.identifier});
  } catch {
    try {
      return await fn({skus: [pkg.identifier]});
    } catch {
      return fn(pkg.identifier);
    }
  }
}

function firstPurchase(value: any) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function purchasePremiumPackage(pkg: DirectStorePackage) {
  if (!isBillingOperational()) return {success: false, isPremium: true};
  await ensureConnection();

  const rawResult = pkg.type === 'subscription'
    ? await requestSubscriptionCompat(pkg)
    : await requestLifetimeCompat(pkg);
  const purchase = firstPurchase(rawResult);

  if (purchase && typeof api().finishTransaction === 'function') {
    try { await api().finishTransaction({purchase, isConsumable: false}); } catch {}
  }

  // Re-read store ownership instead of trusting a local flag.
  const purchases = await availablePurchases(true);
  const isPremium = hasPremiumPurchase(purchases) || isPremiumProduct(productIdOf(purchase));
  if (isPremium) notifyPremium(true);
  return {success: isPremium, isPremium};
}

export async function restorePremiumPurchases() {
  if (!isBillingOperational()) return {success: false, isPremium: true};
  await ensureConnection();
  const purchases = await availablePurchases(false);
  const isPremium = hasPremiumPurchase(purchases);
  if (isPremium) notifyPremium(true);
  return {success: isPremium, isPremium};
}

export async function endPremiumBillingConnection() {
  purchaseUpdateSubscription?.remove?.();
  purchaseErrorSubscription?.remove?.();
  purchaseUpdateSubscription = null;
  purchaseErrorSubscription = null;
  if (connected && typeof api().endConnection === 'function') {
    try { await api().endConnection(); } catch {}
  }
  connected = false;
}
