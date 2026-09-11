import {onRequest} from 'firebase-functions/v2/https';
import {defineSecret, defineString} from 'firebase-functions/params';
import {currencyForCountry} from './countryCurrency';

const googlePlacesKey = defineSecret('GOOGLE_PLACES_API_KEY');
const geminiKey = defineSecret('GEMINI_API_KEY');
const geminiModel = defineString('GEMINI_MODEL', {default: 'gemini-2.5-flash'});

type Coordinates = {latitude: number; longitude: number};

type PlaceApiResult = {
  id?: string;
  displayName?: {text?: string};
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  location?: {latitude?: number; longitude?: number};
  photos?: Array<{name?: string}>;
  primaryType?: string;
  currentOpeningHours?: {openNow?: boolean; weekdayDescriptions?: string[]};
  regularOpeningHours?: {weekdayDescriptions?: string[]};
  editorialSummary?: {text?: string};
};

type AddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type GeocodeResult = {
  formatted_address?: string;
  address_components?: AddressComponent[];
  geometry?: {location?: {lat?: number; lng?: number}};
};

function cors(res: any) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

function requirePost(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return false;
  }
  if (req.method !== 'POST') {
    res.status(405).json({error: 'POST only'});
    return false;
  }
  return true;
}

function haversineMeters(a: Coordinates, b?: {latitude?: number; longitude?: number}) {
  if (b?.latitude == null || b.longitude == null) return undefined;
  const R = 6371e3;
  const p1 = a.latitude * Math.PI / 180;
  const p2 = b.latitude * Math.PI / 180;
  const dp = (b.latitude - a.latitude) * Math.PI / 180;
  const dl = (b.longitude - a.longitude) * Math.PI / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function placeRankScore(place: PlaceApiResult, origin?: Coordinates) {
  const rating = Math.max(0, Math.min(5, place.rating || 0));
  const reviews = Math.max(0, place.userRatingCount || 0);
  const reviewConfidence = Math.min(5, Math.log10(reviews + 1) * 1.4);
  const distance = origin ? haversineMeters(origin, place.location) : undefined;
  const distanceScore = distance == null ? 2.5 : 5 * Math.exp(-distance / 2500);
  return rating * 0.58 + reviewConfidence * 0.27 + distanceScore * 0.15;
}

async function searchPlaces(textQuery: string, location?: Coordinates, maxResultCount = 12) {
  const body: any = {
    textQuery,
    languageCode: 'en',
    maxResultCount: Math.max(1, Math.min(20, maxResultCount)),
  };

  if (location) {
    body.locationBias = {
      circle: {
        center: {latitude: location.latitude, longitude: location.longitude},
        radius: 5000,
      },
    };
  }

  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googlePlacesKey.value(),
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.rating',
        'places.userRatingCount',
        'places.priceLevel',
        'places.googleMapsUri',
        'places.location',
        'places.photos',
        'places.primaryType',
        'places.currentOpeningHours',
      ].join(','),
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) throw new Error(`Places API ${r.status}: ${await r.text()}`);
  return (await r.json()) as {places?: PlaceApiResult[]};
}

async function fetchPlaceDetails(placeId: string) {
  const safeId = encodeURIComponent(placeId);
  const r = await fetch(`https://places.googleapis.com/v1/places/${safeId}`, {
    headers: {
      'X-Goog-Api-Key': googlePlacesKey.value(),
      'X-Goog-FieldMask': [
        'id',
        'displayName',
        'formattedAddress',
        'rating',
        'userRatingCount',
        'priceLevel',
        'googleMapsUri',
        'websiteUri',
        'nationalPhoneNumber',
        'internationalPhoneNumber',
        'location',
        'photos',
        'primaryType',
        'currentOpeningHours',
        'regularOpeningHours',
        'editorialSummary',
      ].join(','),
    },
  });

  if (!r.ok) throw new Error(`Place Details API ${r.status}: ${await r.text()}`);
  return (await r.json()) as PlaceApiResult;
}

async function geocode(params: {coordinates?: Coordinates; address?: string}) {
  const query = new URLSearchParams();
  if (params.coordinates) {
    query.set('latlng', `${params.coordinates.latitude},${params.coordinates.longitude}`);
  } else if (params.address) {
    query.set('address', params.address);
  } else {
    throw new Error('coordinates or address required');
  }
  query.set('key', googlePlacesKey.value());

  const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query.toString()}`);
  if (!r.ok) throw new Error(`Geocoding API ${r.status}: ${await r.text()}`);

  const data: any = await r.json();
  if (data.status !== 'OK' || !Array.isArray(data.results) || !data.results.length) {
    throw new Error(`Geocoding failed: ${data.error_message || data.status || 'no results'}`);
  }
  return data.results[0] as GeocodeResult;
}

function component(result: GeocodeResult, type: string, useShort = false) {
  const found = result.address_components?.find(x => x.types?.includes(type));
  return useShort ? found?.short_name : found?.long_name;
}

function toLocationContext(
  result: GeocodeResult,
  fallbackCurrency: string,
  source: 'current' | 'destination',
  destinationLabel?: string,
) {
  const countryCode = component(result, 'country', true)?.toUpperCase();
  const country = component(result, 'country');
  const region = component(result, 'administrative_area_level_1');
  const city = component(result, 'locality')
    || component(result, 'postal_town')
    || component(result, 'administrative_area_level_2')
    || component(result, 'sublocality');
  const latitude = result.geometry?.location?.lat;
  const longitude = result.geometry?.location?.lng;
  if (latitude == null || longitude == null) throw new Error('Geocoding result has no coordinates');

  return {
    coordinates: {latitude, longitude},
    city,
    region,
    country,
    countryCode,
    currency: currencyForCountry(countryCode, fallbackCurrency || 'USD'),
    formattedAddress: result.formatted_address,
    source,
    destinationLabel,
  };
}

async function callGemini(prompt: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel.value())}:generateContent?key=${encodeURIComponent(geminiKey.value())}`;
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      contents: [{role: 'user', parts: [{text: prompt}]}],
      generationConfig: {responseMimeType: 'application/json', temperature: 0.45},
    }),
  });

  if (!r.ok) throw new Error(`Gemini API ${r.status}: ${await r.text()}`);
  const data: any = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return JSON.parse(text);
}

async function representativePhoto(
  suggestion: any,
  location?: Coordinates,
  destination?: string,
) {
  try {
    const query = destination
      ? `${suggestion.searchKeyword || suggestion.name} in ${destination}`
      : String(suggestion.searchKeyword || suggestion.name);
    const places = (await searchPlaces(query, location, 4)).places || [];
    const candidate = places.find(p => p.photos?.[0]?.name);
    const photoName = candidate?.photos?.[0]?.name;
    if (!photoName) return suggestion;
    return {
      ...suggestion,
      imageUrl: `/placePhoto?name=${encodeURIComponent(photoName)}`,
      imagePlaceName: candidate?.displayName?.text,
      representativeImage: true,
    };
  } catch {
    return suggestion;
  }
}

export const resolveLocation = onRequest({secrets: [googlePlacesKey]}, async (req: any, res: any) => {
  cors(res);
  if (!requirePost(req, res)) return;
  try {
    const {coordinates, fallbackCurrency = 'USD'} = req.body || {};
    if (coordinates?.latitude == null || coordinates?.longitude == null) {
      return void res.status(400).json({error: 'coordinates are required'});
    }
    const result = await geocode({coordinates});
    return void res.json(toLocationContext(result, fallbackCurrency, 'current'));
  } catch (e: any) {
    return void res.status(500).json({error: e?.message || 'Unknown error'});
  }
});

export const resolveDestination = onRequest({secrets: [googlePlacesKey]}, async (req: any, res: any) => {
  cors(res);
  if (!requirePost(req, res)) return;
  try {
    const {destination, fallbackCurrency = 'USD'} = req.body || {};
    if (!String(destination || '').trim()) return void res.status(400).json({error: 'destination is required'});
    const label = String(destination).trim();
    const result = await geocode({address: label});
    return void res.json(toLocationContext(result, fallbackCurrency, 'destination', label));
  } catch (e: any) {
    return void res.status(500).json({error: e?.message || 'Unknown error'});
  }
});

export const recommendMeals = onRequest({secrets: [geminiKey, googlePlacesKey]}, async (req: any, res: any) => {
  cors(res);
  if (!requirePost(req, res)) return;

  try {
    const {
      mode,
      budget,
      destination,
      location,
      locationContext,
      profile,
      history = [],
      preferences = [],
    } = req.body || {};

    if (!budget || !profile?.currency) {
      return void res.status(400).json({error: 'budget and profile.currency are required'});
    }

    const areaLabel = [locationContext?.city, locationContext?.country].filter(Boolean).join(', ');
    const areaQuery = destination
      ? `restaurants in ${destination}`
      : (areaLabel ? `restaurants in ${areaLabel}` : 'restaurants');

    let contextPlaces: PlaceApiResult[] = [];
    if (location || destination || areaLabel) {
      try {
        contextPlaces = (await searchPlaces(areaQuery, location, 10)).places || [];
      } catch {
        contextPlaces = [];
      }
    }

    const compactPlaces = contextPlaces.slice(0, 10).map(p => ({
      name: p.displayName?.text,
      rating: p.rating,
      reviews: p.userRatingCount,
      priceLevel: p.priceLevel,
      address: p.formattedAddress,
      type: p.primaryType,
    }));

    const recentMeals = history.slice(0, 12).map((x: any) => ({
      dish: x.dishName,
      cuisine: x.cuisine,
      city: x.city,
      country: x.country,
      feedback: x.feedback,
    })).filter((x: any) => x.dish);

    const prompt = `You are the recommendation engine for TastePilot, an international food app.\nMode: ${mode}.\nBudget: ${budget} ${profile.currency}.\nUser locale: ${profile.locale}.\nResolved area: ${areaLabel || destination || 'current location'}.\nCountry code: ${locationContext?.countryCode || 'unknown'}.\nDestination text: ${destination || 'current location'}.\nUser food preferences: ${JSON.stringify(profile.preferences || [])}.\nSession preferences: ${JSON.stringify(preferences)}.\nDietary restrictions: ${JSON.stringify(profile.restrictions || [])}.\nRecent meals to avoid repeating or closely duplicating: ${JSON.stringify(recentMeals)}.\nNearby/place context (may be incomplete): ${JSON.stringify(compactPlaces)}.\n\nRules:\n- Return exactly 3 meal suggestions.\n- Never claim an exact restaurant menu item or exact restaurant price unless explicitly present in verified source data.\n- estimatedMin/estimatedMax are reasonable area-level estimates in ${profile.currency}, not verified restaurant menu prices.\n- For daily mode prioritize variety, budget fit, user preference and realistic nearby availability.\n- For travel mode prioritize characteristic local specialties of the resolved destination, then popularity and nearby availability.\n- Respect dietary restrictions.\n- Avoid the same dish and very similar dishes from recent history.\n- searchKeyword must be a short phrase usable in a Google Places text search.\n- Keep reason concise and useful.\n\nReturn ONLY valid JSON: {"suggestions":[{"id":"string","name":"string","cuisine":"string","estimatedMin":number,"estimatedMax":number,"reason":"string","searchKeyword":"string","localSpecialty":boolean}]}`;

    const result = await callGemini(prompt);
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions.slice(0, 3) : [];
    const enriched = await Promise.all(suggestions.map((item: any) => representativePhoto(item, location, destination)));
    return void res.json({suggestions: enriched});
  } catch (e: any) {
    return void res.status(500).json({error: e?.message || 'Unknown error'});
  }
});

export const searchRestaurants = onRequest({secrets: [googlePlacesKey]}, async (req: any, res: any) => {
  cors(res);
  if (!requirePost(req, res)) return;

  try {
    const {keyword, location, destination} = req.body || {};
    if (!keyword) return void res.status(400).json({error: 'keyword is required'});
    const query = destination ? `${keyword} in ${destination}` : keyword;
    const data = await searchPlaces(query, location, 15);

    const restaurants = (data.places || [])
      .sort((a, b) => placeRankScore(b, location) - placeRankScore(a, location))
      .map(p => ({
        id: p.id || `${p.displayName?.text}-${p.formattedAddress}`,
        name: p.displayName?.text || 'Restaurant',
        rating: p.rating || 0,
        reviews: p.userRatingCount || 0,
        address: p.formattedAddress || '',
        priceLevel: p.priceLevel,
        mapsUrl: p.googleMapsUri,
        imageUrl: p.photos?.[0]?.name ? `/placePhoto?name=${encodeURIComponent(p.photos[0].name!)}` : undefined,
        distanceMeters: location ? haversineMeters(location, p.location) : undefined,
        latitude: p.location?.latitude,
        longitude: p.location?.longitude,
        openNow: p.currentOpeningHours?.openNow,
        primaryType: p.primaryType,
      }))
      .slice(0, 10);

    return void res.json({restaurants});
  } catch (e: any) {
    return void res.status(500).json({error: e?.message || 'Unknown error'});
  }
});

export const placeDetails = onRequest({secrets: [googlePlacesKey]}, async (req: any, res: any) => {
  cors(res);
  if (!requirePost(req, res)) return;

  try {
    const placeId = String(req.body?.placeId || '').trim();
    if (!placeId) return void res.status(400).json({error: 'placeId is required'});

    const p = await fetchPlaceDetails(placeId);
    return void res.json({
      id: p.id || placeId,
      name: p.displayName?.text || 'Restaurant',
      rating: p.rating || 0,
      reviews: p.userRatingCount || 0,
      address: p.formattedAddress || '',
      priceLevel: p.priceLevel,
      mapsUrl: p.googleMapsUri,
      imageUrl: p.photos?.[0]?.name ? `/placePhoto?name=${encodeURIComponent(p.photos[0].name!)}` : undefined,
      latitude: p.location?.latitude,
      longitude: p.location?.longitude,
      openNow: p.currentOpeningHours?.openNow,
      primaryType: p.primaryType,
      phone: p.nationalPhoneNumber,
      internationalPhone: p.internationalPhoneNumber,
      websiteUri: p.websiteUri,
      openingHours: p.regularOpeningHours?.weekdayDescriptions || p.currentOpeningHours?.weekdayDescriptions || [],
      editorialSummary: p.editorialSummary?.text,
    });
  } catch (e: any) {
    return void res.status(500).json({error: e?.message || 'Unknown error'});
  }
});

export const placePhoto = onRequest({secrets: [googlePlacesKey]}, async (req: any, res: any) => {
  cors(res);
  if (req.method === 'OPTIONS') return void res.status(204).send('');
  const name = String(req.query?.name || '');
  if (!name.startsWith('places/')) return void res.status(400).send('Invalid photo name');

  try {
    const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=1200&key=${encodeURIComponent(googlePlacesKey.value())}`;
    const r = await fetch(url);
    if (!r.ok) return void res.status(r.status).send('Photo unavailable');
    const contentType = r.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await r.arrayBuffer());
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    return void res.status(200).send(buffer);
  } catch (e: any) {
    return void res.status(500).send(e?.message || 'Photo error');
  }
});
