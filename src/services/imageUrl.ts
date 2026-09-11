import {API_BASE_URL} from './config';

export function resolveApiImageUrl(uri: string) {
  if (uri.startsWith('/')) return `${API_BASE_URL}${uri}`;
  return uri;
}
