import {API_BASE_URL} from './config';

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {error: text};
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data
      ? String((data as {error?: unknown}).error || `API error ${response.status}`)
      : `API error ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
