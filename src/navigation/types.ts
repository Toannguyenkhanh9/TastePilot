import {LocationContext, MealSuggestion, Restaurant} from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  DailyMeal: undefined;
  TravelFood: undefined;
  MealResults: {
    mode: 'daily' | 'travel';
    title: string;
    suggestions: MealSuggestion[];
    destination?: string;
    currency: string;
    locale: string;
    locationContext?: LocationContext;
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
