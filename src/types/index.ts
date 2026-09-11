export type RecommendationMode = 'daily' | 'travel';

export type Coordinates = {
  latitude: number;
  longitude: number;
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
  name: string;
  cuisine: string;
  estimatedMin: number;
  estimatedMax: number;
  reason: string;
  imageUrl?: string;
  imagePlaceName?: string;
  representativeImage?: boolean;
  searchKeyword: string;
  localSpecialty?: boolean;
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
};
