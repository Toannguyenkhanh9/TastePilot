import {
  Coordinates,
  LocationContext,
  MealHistoryItem,
  MealSuggestion,
  MealType,
  TravelGuideCategory,
  MoodKey,
  GroupSession,
  Restaurant,
  UserProfile,
} from '../types';

export type MealResultsRequestContext = {
  mode: 'daily' | 'travel';
  budget?: number;
  preferences?: string[];
  destination?: string;
  location?: Coordinates;
  locationContext?: LocationContext;
  history?: MealHistoryItem[];
  profile: UserProfile;
  mealType?: MealType;
  travelCategory?: TravelGuideCategory;
  mood?: MoodKey;
  groupSession?: GroupSession;
  groupMode?: boolean;
};

export type RootStackParamList = {
  MainTabs: undefined;
  DailyMeal: undefined;
  TravelFood: undefined;
  GroupMode: undefined;
  WeeklyPlanner: undefined;
  SurpriseMe: undefined;
  Premium: undefined;
  MealResults: {
    mode: 'daily' | 'travel';
    title: string;
    suggestions: MealSuggestion[];
    destination?: string;
    currency: string;
    locale: string;
    locationContext?: LocationContext;
    requestContext: MealResultsRequestContext;
  };
  Restaurants: {
    meal: MealSuggestion;
    mode: 'daily' | 'travel';
    destination?: string;
    locationContext?: LocationContext;
  };
  RestaurantDetail: {
    place: Restaurant;
    meal: MealSuggestion;
    mode: 'daily' | 'travel';
    locationContext?: LocationContext;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Saved: undefined;
  History: undefined;
  Profile: undefined;
};
