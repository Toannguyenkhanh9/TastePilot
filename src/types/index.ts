export type RecommendationMode = 'daily' | 'travel';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type MealTypeSelection = 'auto' | MealType;
export type AllergyKey = 'Peanuts' | 'Shellfish' | 'Dairy' | 'Egg' | 'Sesame';
export type SpicePreference = 'any' | 'mild' | 'medium' | 'spicy';
export type TravelGuideCategory = 'must_try' | 'street_food' | 'hidden_gems' | 'dessert';
export type MoodKey = 'quick' | 'healthy' | 'comfort' | 'date_night' | 'family' | 'late_night' | 'hot' | 'light';
export type NotificationFrequency = 'daily' | 'weekdays' | 'three_per_week' | 'weekends';
export type SmartNotificationSettings = {
  enabled: boolean;
  frequency: NotificationFrequency;
  meals: MealType[];
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  travelNearbyEnabled: boolean;
  travelRadiusMeters: number;
};


export type GroupMember = {
  id: string;
  name: string;
  budget?: number;
  preferences: string[];
  restrictions: string[];
  allergies: AllergyKey[];
  spicePreference: SpicePreference;
};

export type GroupSession = {
  id: string;
  name: string;
  currency: string;
  mealType: MealType;
  mood?: MoodKey;
  members: GroupMember[];
  createdAt: string;
};

export type WeeklyPlanDay = {
  id: string;
  dateISO: string;
  mealType: MealType;
  meal: MealSuggestion;
};

export type WeeklyMealPlan = {
  id: string;
  createdAt: string;
  locale: string;
  currency: string;
  mealType: MealType;
  count: 5 | 7;
  mood?: MoodKey;
  days: WeeklyPlanDay[];
};

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
  resolvedAt?: string;
};

export type UserProfile = {
  currency: string;
  locale: string;
  defaultBudget: number;
  preferences: string[];
  restrictions: string[];
  autoCurrency?: boolean;
  allergies?: AllergyKey[];
  spicePreference?: SpicePreference;
  recentMood?: MoodKey;
  smartNotifications?: SmartNotificationSettings;
};

export type MealSuggestion = {
  id: string;
  canonicalId?: string;
  name: string;
  cuisine: string;
  canonicalName?: string;
  canonicalCuisine?: string;
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
  tasteMatchPercent?: number;
  allergyFilterApplied?: boolean;
  travelCategory?: TravelGuideCategory;
  mood?: MoodKey;
  groupMatchPercent?: number;
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
  smartScore?: number;
  smartRankReason?: string;

  // Saved-place metadata. These are filled when the user saves from a meal search.
  savedCity?: string;
  savedCountry?: string;
  savedCuisine?: string;
  savedDishName?: string;
  savedAt?: string;
};

export type RestaurantReview = {
  id: string;
  authorName: string;
  authorUri?: string;
  authorPhotoUri?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  publishedAt?: string;
  languageCode?: string;
};

export type RestaurantDetails = Restaurant & {
  phone?: string;
  internationalPhone?: string;
  websiteUri?: string;
  openingHours?: string[];
  editorialSummary?: string;
  userReviews?: RestaurantReview[];
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
