/**
 * Start CRA with REACT_APP_DOMAIN set (works on Windows without cross-env).
 * Usage: node scripts/start-with-domain.js squash|fitness
 */
const { spawn } = require('child_process');
const path = require('path');

const domain = (process.argv[2] || 'fitness').trim().toLowerCase();
if (domain !== 'squash' && domain !== 'fitness') {
  console.error('Usage: node scripts/start-with-domain.js squash|fitness');
  process.exit(1);
}

const env = {
  ...process.env,
  REACT_APP_DOMAIN: domain,
  BROWSER: process.env.BROWSER || 'none',
};

console.log(`Starting frontend with REACT_APP_DOMAIN=${domain}`);
console.log('Open http://localhost:3000/ for the domain portal, or go directly to /fitness or /squash.');

const reactScripts = require.resolve('react-scripts/bin/react-scripts.js');
const child = spawn(process.execPath, [reactScripts, 'start'], {
  cwd: path.join(__dirname, '..'),
  env,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => process.exit(code ?? 0));
