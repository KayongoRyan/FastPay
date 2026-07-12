import { getApiBaseUrl } from './config';

type AccessTokenProvider = () => Promise<string | null>;
type TokenRefresher = () => Promise<string | null>;

const API_TIMEOUT_MS = __DEV__ ? 30_000 : 8_000;
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.';

let accessTokenProvider: AccessTokenProvider | null = null;
let tokenRefresher: TokenRefresher | null = null;

export function setAccessTokenProvider(provider: AccessTokenProvider | null): void {
  accessTokenProvider = provider;
}

export function setTokenRefresher(refresher: TokenRefresher | null): void {
  tokenRefresher = refresher;
}

export function getApiUrl(): string {
  return getApiBaseUrl();
}

async function resolveAccessToken(forceRefresh = false): Promise<string | null> {
  if (!accessTokenProvider) {
    return null;
  }

  if (!forceRefresh) {
    const token = await accessTokenProvider();
    if (token) {
      return token;
    }
  }

  if (!tokenRefresher) {
    return accessTokenProvider();
  }

  return tokenRefresher();
}

async function buildHeaders(
  authenticated: boolean,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = await resolveAccessToken();
    if (!token) {
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseError(response: Response, path: string): Promise<never> {
  const text = await response.text();
  let message = `${path} failed (${response.status})`;

  try {
    const body = JSON.parse(text) as { message?: string | string[] };
    if (typeof body.message === 'string') {
      message = body.message;
    } else if (Array.isArray(body.message)) {
      message = body.message.join(', ');
    }
  } catch {
    if (text) {
      message = text;
    }
  }

  if (
    response.status === 404 &&
    path.startsWith('/payments/history')
  ) {
    message =
      'Payment history API is unavailable. In fastpay-backend run: npm run start:payment && npm run start:gateway';
  }

  if (response.status === 401 && message === 'Unauthorized') {
    message = SESSION_EXPIRED_MESSAGE;
  }

  throw new Error(message);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Cannot reach API at ${getApiUrl()} (timed out after ${API_TIMEOUT_MS / 1000}s). ` +
          'Ensure phone and PC are on the same Wi‑Fi, backend is running (npm run start:gateway), ' +
          'and open http://<your-pc-ip>:3000/health in the phone browser.',
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiFetch<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  authenticated = false,
  retried = false,
): Promise<T> {
  const headers = await buildHeaders(authenticated);

  let response: Response;
  try {
    response = await fetchWithTimeout(`${getApiUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Cannot reach API at ${getApiUrl()}. Start the backend gateway and try again.`,
    );
  }

  if (
    !response.ok &&
    authenticated &&
    response.status === 401 &&
    tokenRefresher &&
    !retried
  ) {
    const refreshed = await resolveAccessToken(true);
    if (refreshed) {
      return apiFetch<T>(method, path, body, authenticated, true);
    }
  }

  if (!response.ok) {
    await parseError(response, path);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>('POST', path, body);
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>('GET', path);
}

export async function apiPostAuth<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>('POST', path, body, true);
}

export async function apiGetAuth<T>(path: string): Promise<T> {
  return apiFetch<T>('GET', path, undefined, true);
}
