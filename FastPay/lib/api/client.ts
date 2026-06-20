const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type AccessTokenProvider = () => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider | null = null;

export function setAccessTokenProvider(provider: AccessTokenProvider | null): void {
  accessTokenProvider = provider;
}

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, '');
}

async function buildHeaders(
  authenticated: boolean,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated && accessTokenProvider) {
    const token = await accessTokenProvider();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
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

  throw new Error(message);
}

async function apiFetch<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  authenticated = false,
): Promise<T> {
  const headers = await buildHeaders(authenticated);
  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

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
