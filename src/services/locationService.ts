import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {Coordinates} from '../types';

async function requestPermission() {
  if (Platform.OS === 'ios') {
    const result = await Geolocation.requestAuthorization('whenInUse');
    return result === 'granted';
  }

  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  return (
    result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
    result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
  );
}

/**
 * Fetch a fresh foreground position. We keep the original device coordinates all the way
 * through restaurant search; resolving the city/country must never replace the user's GPS.
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  const ok = await requestPermission();
  if (!ok) throw new Error('Location permission denied');

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : undefined,
      }),
      error => reject(new Error(error.message || 'Could not get current location')),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  });
}
