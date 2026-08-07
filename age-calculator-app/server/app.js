import { calculateAge, parseDateOfBirth, utcToday } from './age.js';

const MAX_BODY_BYTES = 10_000;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

export function createApp({ now = () => new Date() } = {}) {
  return async function app(request, response) {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);

    if (url.pathname !== '/api/age') {
      sendJson(response, 404, { error: 'Not found.' });
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      sendJson(response, 405, { error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      const body = await readJson(request);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        sendJson(response, 400, { error: 'Request body must be a JSON object.' });
        return;
      }

      const parsed = parseDateOfBirth(body.dateOfBirth);
      if (parsed.error) {
        sendJson(response, 400, { error: parsed.error });
        return;
      }

      const today = utcToday(now());
      if (parsed.date > today) {
        sendJson(response, 400, { error: 'dateOfBirth cannot be in the future.' });
        return;
      }

      sendJson(response, 200, {
        dateOfBirth: body.dateOfBirth,
        age: calculateAge(parsed.date, today),
      });
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, {
        error: error.statusCode ? error.message : 'Internal server error.',
      });
    }
  };
}
