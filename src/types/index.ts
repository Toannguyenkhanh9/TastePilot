export type RecommendationMode = 'daily' | 'travel';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type MealTypeSelection = 'auto' | MealType;

export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
};

export type LocationContext = {
  coordinates: Coordinates;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  currency: string;
  formattedAddress?: string;
  source: 'current' | 'destination';
  destinationLabel?: string;
};

export type UserProfile = {
  currency: string;
  locale: string;
  defaultBudget: number;
  preferences: string[];
  restrictions: string[];
  autoCurrency?: boolean;
};

export type MealSuggestion = {
  id: string;
  canonicalId?: string;
  name: string;
  cuisine: string;
  estimatedMin: number;
  estimatedMax: number;
  reason: string;
  imageUrl?: string;
  imagePlaceName?: string;
  representativeImage?: boolean;
  imageSource?: 'catalog' | 'places';
  visualEmoji?: string;
  searchKeyword: string;
  localSpecialty?: boolean;
  imageKey?: string;
  recommendationSource?: 'local' | 'ai';
  familyId?: string;
  priceTier?: 1 | 2 | 3 | 4;
  priceEstimateSource?: 'regional_profile' | 'currency_fallback' | 'ai' | 'menu' | 'places';
  priceConfidence?: 'low' | 'medium' | 'high';
  regionalPriceProfileVersion?: string;
  mealType?: MealType;
  touristPopular?: boolean;
};

export type Restaurant = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distanceMeters?: number;
  address: string;
  priceLevel?: string;
  imageUrl?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  openNow?: boolean;
  primaryType?: string;

  // Saved-place metadata. These are filled when the user saves from a meal search.
  savedCity?: string;
  savedCountry?: string;
  savedCuisine?: string;
  savedDishName?: string;
  savedAt?: string;
};

export type RestaurantDetails = Restaurant & {
  phone?: string;
  internationalPhone?: string;
  websiteUri?: string;
  openingHours?: string[];
  editorialSummary?: string;
};

export type MealHistoryItem = {
  id: string;
  dishName: string;
  cuisine: string;
  mode: RecommendationMode;
  restaurantName?: string;
  city?: string;
  country?: string;
  currency?: string;
  createdAt: string;
  feedback?: 'love' | 'ok' | 'dislike';

  // Snapshot saved when the user chooses a restaurant.
  // Old history items may not have these fields.
  restaurantSnapshot?: Restaurant;
  mealSnapshot?: MealSuggestion;
};
