const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, '');
}

export async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${path} failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${path} failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}
