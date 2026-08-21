import type { Age } from '../utils/date';

type AgeApiResponse = {
  dateOfBirth: string;
  age: Age;
};

const REQUEST_TIMEOUT_MS = 60_000;

const configuredApiUrl = process.env.EXPO_PUBLIC_AGE_API_URL?.trim();

function resolveApiUrl(value: string | undefined): string | null {
  if (!value) return null;

  const withoutTrailingSlashes = value.replace(/\/+$/, '');

  try {
    const url = new URL(withoutTrailingSlashes);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    // 10.0.2.2 only reaches the host from an Android emulator, never a phone.
    if (url.hostname === '10.0.2.2') return null;
    if (!__DEV__ && url.protocol !== 'https:') return null;
    return withoutTrailingSlashes;
  } catch {
    return null;
  }
}

export const AGE_API_URL = resolveApiUrl(configuredApiUrl);

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isAge(value: unknown): value is Age {
  if (!value || typeof value !== 'object') return false;
  const age = value as Record<string, unknown>;
  return ['years', 'months', 'days'].every(
    (key) => Number.isInteger(age[key]) && Number(age[key]) >= 0,
  );
}

export async function calculateAgeFromApi(birthDate: Date): Promise<Age> {
  if (!AGE_API_URL) {
    throw new Error(
      'The age service is not configured. Please install an updated build or try again later.',
    );
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(`${AGE_API_URL}/api/age`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateOfBirth: formatDateForApi(birthDate) }),
      signal: controller.signal,
    });
  } catch {
    throw new Error(
      'The age service cannot be reached right now. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timeout);
  }

  let data: AgeApiResponse | { error?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error('The age API returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error('error' in data && data.error ? data.error : 'Unable to calculate age.');
  }

  if (!('age' in data) || !isAge(data.age)) {
    throw new Error('The age API returned an invalid response.');
  }

  return data.age;
}
