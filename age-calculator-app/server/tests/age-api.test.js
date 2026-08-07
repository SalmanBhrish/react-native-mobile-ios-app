import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { createApp } from '../app.js';

const fixedNow = new Date('2026-08-07T18:30:00.000Z');
let baseUrl;
let server;

before(async () => {
  server = createServer(createApp({ now: () => fixedNow }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

async function post(body, headers = { 'Content-Type': 'application/json' }) {
  return fetch(`${baseUrl}/api/age`, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

test('returns age in years, months, and days as JSON', async () => {
  const response = await post({ dateOfBirth: '2000-01-15' });

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.deepEqual(await response.json(), {
    dateOfBirth: '2000-01-15',
    age: { years: 26, months: 6, days: 23 },
  });
});

test('handles leap-day birthdays', async () => {
  const response = await post({ dateOfBirth: '2000-02-29' });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).age, { years: 26, months: 5, days: 9 });
});

test('accepts a birth date of today', async () => {
  const response = await post({ dateOfBirth: '2026-08-07' });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).age, { years: 0, months: 0, days: 0 });
});

for (const [name, body, message] of [
  ['missing date', {}, 'dateOfBirth is required'],
  ['wrong format', { dateOfBirth: '01/15/2000' }, 'YYYY-MM-DD'],
  ['impossible date', { dateOfBirth: '2023-02-29' }, 'valid calendar date'],
  ['future date', { dateOfBirth: '2026-08-08' }, 'cannot be in the future'],
]) {
  test(`rejects ${name}`, async () => {
    const response = await post(body);
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, new RegExp(message));
  });
}

test('rejects malformed JSON', async () => {
  const response = await post('{not json');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Request body must be valid JSON.' });
});

test('returns 405 for unsupported methods', async () => {
  const response = await fetch(`${baseUrl}/api/age`);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
});

test('returns 404 for unknown routes', async () => {
  const response = await fetch(`${baseUrl}/unknown`);
  assert.equal(response.status, 404);
});

test('allows the Expo web UI to call the API', async () => {
  const response = await fetch(`${baseUrl}/api/age`, { method: 'OPTIONS' });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), '*');
  assert.match(response.headers.get('access-control-allow-methods'), /POST/);
});
