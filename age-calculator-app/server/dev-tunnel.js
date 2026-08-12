import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const apiUrl = 'http://localhost:3000/api/age';
const children = [];
let stopping = false;

function start(command, args, options = {}) {
  const child = spawn(command, args, options);
  children.push(child);
  child.on('error', (error) => {
    console.error(`Could not start ${command}: ${error.message}`);
    stop(1);
  });
  return child;
}

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exitCode = exitCode;
}

async function apiIsRunning() {
  try {
    await fetch(apiUrl);
    return true;
  } catch {
    return false;
  }
}

async function waitForApi() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await apiIsRunning()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('The backend did not start on port 3000.');
}

function cloudflaredCommand() {
  const configuredPath = process.env.CLOUDFLARED_PATH;
  const windowsPaths = [
    configuredPath,
    'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
    'C:\\Program Files\\cloudflared\\cloudflared.exe',
  ].filter(Boolean);

  return windowsPaths.find((path) => existsSync(path)) ?? 'cloudflared';
}

function createBackendTunnel() {
  return new Promise((resolve, reject) => {
    const tunnel = start(
      cloudflaredCommand(),
      ['tunnel', '--url', 'http://localhost:3000'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const timeout = setTimeout(() => {
      reject(new Error('Cloudflare did not provide a tunnel URL within 60 seconds.'));
    }, 60_000);

    let settled = false;
    const handleOutput = (chunk) => {
      const output = chunk.toString();
      process.stdout.write(output);
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (match && !settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(match[0]);
      }
    };

    tunnel.stdout.on('data', handleOutput);
    tunnel.stderr.on('data', handleOutput);
    tunnel.on('exit', (code) => {
      if (!settled) {
        clearTimeout(timeout);
        reject(new Error(`Cloudflare Tunnel stopped with exit code ${code}.`));
      } else if (!stopping) {
        console.error('Cloudflare Tunnel stopped.');
        stop(code || 1);
      }
    });
  });
}

async function main() {
  if (await apiIsRunning()) {
    console.log('Using the backend already running on port 3000.');
  } else {
    console.log('Starting the backend on port 3000...');
    const api = start(process.execPath, ['server/index.js'], { stdio: 'inherit' });
    api.on('exit', (code) => {
      if (!stopping) stop(code || 1);
    });
    await waitForApi();
  }

  console.log('Creating a public URL for the backend...');
  const publicApiUrl = await createBackendTunnel();
  console.log(`Backend tunnel ready: ${publicApiUrl}`);
  console.log('Starting Expo Tunnel. Scan its QR code with Expo Go.');

  const expo = start(
    process.execPath,
    ['node_modules/expo/bin/cli', 'start', '--tunnel', '--clear'],
    {
      stdio: 'inherit',
      env: { ...process.env, EXPO_PUBLIC_AGE_API_URL: publicApiUrl },
    },
  );
  expo.on('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

main().catch((error) => {
  console.error(error.message);
  stop(1);
});
