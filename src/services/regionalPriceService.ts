import {LocationContext} from '../types';

const PRICE_DATA = require('../data/regionalPriceProfiles.json') as {
  version: string;
  currencyFallbackTypicalMeal: Record<string, number>;
  countries: Record<string, {
    currency: string;
    typicalMeal: number;
    updatedAt: string;
    cities?: Record<string, number>;
  }>;
};

export type RegionalPriceEstimate = {
  min: number;
  max: number;
  midpoint: number;
  priceTier: 1 | 2 | 3 | 4;
  source: 'regional_profile' | 'currency_fallback';
  confidence: 'medium' | 'low';
  profileVersion: string;
};

function normalize(value?: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const MONEY_STEP: Record<string, number> = {
  VND: 5000,
  JPY: 100,
  KRW: 1000,
  IDR: 5000,
  INR: 10,
  THB: 10,
  CNY: 5,
  RUB: 50,
  PHP: 10,
  TWD: 10,
  HKD: 5,
  TRY: 10,
};

function roundMoney(value: number, currency: string) {
  const step = MONEY_STEP[String(currency || '').toUpperCase()] || 1;
  return Math.max(step, Math.round(value / step) * step);
}

function cityMultiplier(city: string | undefined, cities?: Record<string, number>) {
  if (!city || !cities) return 1;
  const wanted = normalize(city);
  for (const [name, multiplier] of Object.entries(cities)) {
    const normalized = normalize(name);
    if (wanted === normalized || wanted.includes(normalized) || normalized.includes(wanted)) {
      return multiplier;
    }
  }
  return 1;
}

function bandFromRelativeCost(relativeCost: number): 1 | 2 | 3 | 4 {
  if (relativeCost <= 0.62) return 1;
  if (relativeCost <= 0.90) return 2;
  if (relativeCost <= 1.20) return 3;
  return 4;
}

/**
 * Estimates a local dish price from a regional "typical meal" anchor.
 *
 * Important:
 * - User budget is NOT used to manufacture the displayed price range.
 * - The user's budget is only used later for ranking/filtering.
 * - Google Places priceLevel / a real menu should override this estimate
 *   when the user opens actual restaurants.
 */
export function estimateRegionalDishPrice(input: {
  relativeCost?: number;
  priceBand?: number;
  currency: string;
  locationContext?: LocationContext;
}): RegionalPriceEstimate {
  const currency = String(input.currency || input.locationContext?.currency || 'USD').toUpperCase();
  const countryCode = String(input.locationContext?.countryCode || '').toUpperCase();
  const country = PRICE_DATA.countries[countryCode];

  const fallbackAnchor = PRICE_DATA.currencyFallbackTypicalMeal[currency] || 15;
  const anchor = country?.currency === currency ? country.typicalMeal : fallbackAnchor;
  const cityFactor = country ? cityMultiplier(input.locationContext?.city, country.cities) : 1;

  const bandFallback = [0, 0.52, 0.76, 1.02, 1.42][input.priceBand || 2] || 0.76;
  const relativeCost = Math.max(0.25, Math.min(2.5, input.relativeCost || bandFallback));

  const midpoint = anchor * cityFactor * relativeCost;

  // Keep the range intentionally broad because this is a market estimate,
  // not a restaurant menu price.
  // Keep the displayed estimate reasonably tight. Budget matching applies a
  // separate ±20% hard window around the user's target amount.
  const low = midpoint * 0.90;
  const high = midpoint * 1.10;

  return {
    min: roundMoney(low, currency),
    max: roundMoney(high, currency),
    midpoint: roundMoney(midpoint, currency),
    priceTier: bandFromRelativeCost(relativeCost),
    source: country ? 'regional_profile' : 'currency_fallback',
    confidence: country ? 'medium' : 'low',
    profileVersion: PRICE_DATA.version,
  };
}

export function getRegionalPriceProfileVersion() {
  return PRICE_DATA.version;
}
