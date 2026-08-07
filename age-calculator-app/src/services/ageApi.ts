import { Platform } from 'react-native';
import type { Age } from '../utils/date';

type AgeApiResponse = {
  dateOfBirth: string;
  age: Age;
};

const defaultApiUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

export const AGE_API_URL = (
  process.env.EXPO_PUBLIC_AGE_API_URL ?? defaultApiUrl
).replace(/\/$/, '');

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
  let response: Response;

  try {
    response = await fetch(`${AGE_API_URL}/api/age`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateOfBirth: formatDateForApi(birthDate) }),
    });
  } catch {
    throw new Error('Cannot connect to the age API. Make sure npm run dev is running.');
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
