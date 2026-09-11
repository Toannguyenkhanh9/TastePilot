import {USE_MOCK_API} from './config';
import {postJson} from './apiClient';
import {dailyMock, restaurantsMock, travelMock} from './mockData';
import {
  Coordinates,
  LocationContext,
  MealHistoryItem,
  MealSuggestion,
  Restaurant,
  UserProfile,
} from '../types';

type DailyRequest = {
  budget: number;
  preferences: string[];
  location?: Coordinates;
  locationContext?: LocationContext;
  history: MealHistoryItem[];
  profile: UserProfile;
};

type TravelRequest = {
  budget: number;
  destination?: string;
  location?: Coordinates;
  locationContext?: LocationContext;
  profile: UserProfile;
};

export async function getDailyRecommendations(input: DailyRequest): Promise<MealSuggestion[]> {
  if (USE_MOCK_API) {
    const recent = new Set(input.history.slice(0, 8).map(x => x.dishName.toLowerCase()));
    return dailyMock.filter(x => !recent.has(x.name.toLowerCase())).slice(0, 3);
  }

  const data = await postJson<{suggestions: MealSuggestion[]}>('recommendMeals', {
    mode: 'daily',
    ...input,
  });
  return data.suggestions;
}

export async function getTravelRecommendations(input: TravelRequest): Promise<MealSuggestion[]> {
  if (USE_MOCK_API) return travelMock;

  const data = await postJson<{suggestions: MealSuggestion[]}>('recommendMeals', {
    mode: 'travel',
    ...input,
  });
  return data.suggestions;
}

export async function getRestaurantsForMeal(
  meal: MealSuggestion,
  location?: Coordinates,
  destination?: string,
): Promise<Restaurant[]> {
  if (USE_MOCK_API) {
    return restaurantsMock.map((r, i) => ({
      ...r,
      id: `${r.id}-${i}`,
      name: `${meal.name} · ${r.name}`,
      latitude: location?.latitude,
      longitude: location?.longitude,
      openNow: i !== 2,
      primaryType: 'restaurant',
    }));
  }

  const data = await postJson<{restaurants: Restaurant[]}>('searchRestaurants', {
    keyword: meal.searchKeyword,
    location,
    destination,
  });
  return data.restaurants;
}
