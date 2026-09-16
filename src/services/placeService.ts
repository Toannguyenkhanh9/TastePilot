import {USE_MOCK_API} from './config';
import {postJson} from './apiClient';
import {Coordinates, LocationContext, Restaurant, RestaurantDetails} from '../types';

function mockContext(
  coordinates: Coordinates,
  fallbackCurrency: string,
  source: 'current' | 'destination',
  destinationLabel?: string,
): LocationContext {
  return {
    coordinates,
    city: source === 'destination' ? destinationLabel : 'Current area',
    country: source === 'destination' ? 'Destination' : 'Current country',
    currency: fallbackCurrency,
    source,
    destinationLabel,
    resolvedAt: new Date().toISOString(),
  };
}

export async function resolveCurrentLocation(
  coordinates: Coordinates,
  fallbackCurrency: string,
): Promise<LocationContext> {
  if (USE_MOCK_API) return mockContext(coordinates, fallbackCurrency, 'current');
  const resolved = await postJson<LocationContext>('resolveLocation', {coordinates, fallbackCurrency});
  return {...resolved, coordinates, source: 'current', resolvedAt: new Date().toISOString()};
}

export async function resolveDestination(
  destination: string,
  fallbackCurrency: string,
): Promise<LocationContext> {
  if (USE_MOCK_API) {
    return mockContext(
      {latitude: 0, longitude: 0},
      fallbackCurrency,
      'destination',
      destination,
    );
  }
  const resolved = await postJson<LocationContext>('resolveDestination', {destination, fallbackCurrency});
  return {...resolved, source: 'destination', destinationLabel: destination, resolvedAt: new Date().toISOString()};
}

export async function getRestaurantDetails(
  place: Restaurant,
): Promise<RestaurantDetails> {
  if (USE_MOCK_API) {
    return {
      ...place,
      phone: '+1 555 010 2040',
      websiteUri: 'https://example.com',
      openingHours: [
        'Monday: 11:00 AM – 10:00 PM',
        'Tuesday: 11:00 AM – 10:00 PM',
        'Wednesday: 11:00 AM – 10:00 PM',
        'Thursday: 11:00 AM – 10:00 PM',
        'Friday: 11:00 AM – 11:00 PM',
        'Saturday: 11:00 AM – 11:00 PM',
        'Sunday: 11:00 AM – 9:00 PM',
      ],
      editorialSummary: 'Representative restaurant details are shown in mock mode.',
    };
  }

  const remote = await postJson<RestaurantDetails>('placeDetails', {placeId: place.id});
  return {...place, ...remote, distanceMeters: place.distanceMeters ?? remote.distanceMeters};
}
