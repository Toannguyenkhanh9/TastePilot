import {API_BASE_URL} from './config';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RESPONSE_CHARS = 2_000_000;
const MAX_INFLIGHT_KEYS = 50;
const inflight = new Map<string, Promise<unknown>>();

export class TastePilotApiError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'TastePilotApiError';
    this.code = code;
    this.status = status;
  }
}

function devLog(...args: unknown[]) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[TastePilot API]', ...args);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requestKey(path: string, body: unknown) {
  let serialized = '';
  try {
    serialized = JSON.stringify(body);
  } catch {
    serialized = String(body);
  }
  // Key stays only in memory; it is never logged or persisted.
  return `${path}:${serialized}`;
}

async function execute<T>(
  path: string,
  body: unknown,
  attempt = 0,
): Promise<T> {
  const url = `${API_BASE_URL}/${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    devLog(path, `attempt=${attempt + 1}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();

    if (text.length > MAX_RESPONSE_CHARS) {
      throw new TastePilotApiError(
        'The service returned too much data. Please try again.',
        'response_too_large',
        response.status,
      );
    }

    let data: unknown = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
    }

    if (!response.ok) {
      // One retry for temporary server failures. 429 is intentionally not
      // retried immediately so the app respects provider quota pressure.
      if (response.status >= 500 && attempt < 1) {
        await sleep(700);
        return execute<T>(path, body, attempt + 1);
      }

      const message =
        response.status === 429
          ? 'The service is busy right now. Please try again shortly.'
          : response.status >= 500
            ? 'The service is temporarily unavailable. Please try again.'
            : 'The request could not be completed.';

      throw new TastePilotApiError(
        message,
        response.status === 429 ? 'rate_limited' : 'http_error',
        response.status,
      );
    }

    devLog(path, `status=${response.status}`);
    return data as T;
  } catch (error) {
    if (error instanceof TastePilotApiError) throw error;

    const isAbort =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.toLowerCase().includes('abort'));

    if (isAbort) {
      throw new TastePilotApiError(
        'The request timed out. Check your connection and try again.',
        'timeout',
      );
    }

    if (attempt < 1) {
      await sleep(500);
      return execute<T>(path, body, attempt + 1);
    }

    throw new TastePilotApiError(
      'Could not connect to the service. Check your internet connection.',
      'network_error',
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function postJson<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const key = requestKey(path, body);
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = execute<T>(path, body)
    .finally(() => {
      inflight.delete(key);
    });

  if (inflight.size >= MAX_INFLIGHT_KEYS) {
    const oldest = inflight.keys().next().value;
    if (oldest) inflight.delete(oldest);
  }

  inflight.set(key, promise);
  return promise;
}
