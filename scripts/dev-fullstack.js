/**
 * Start API + CRA together. Root `/` shows the fitness/squash portal (no REACT_APP_DOMAIN lock).
 * Usage: node scripts/dev-fullstack.js
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(name, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('exit', (code, signal) => {
    if (signal) return;
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
      process.exit(code);
    }
  });
  return child;
}

console.log('Starting full stack:');
console.log('  API      → http://localhost:4000');
console.log('  Frontend → http://localhost:3000/ (domain portal — pick Fitness or Squash)');
console.log('  Landings → /fitness  /squash');
console.log('');

const backend = run('api', 'npm', ['run', 'dev', '--workspace=backend']);

const frontendEnv = { ...process.env, BROWSER: process.env.BROWSER || 'none' };
delete frontendEnv.REACT_APP_DOMAIN;

const reactScripts = require.resolve('react-scripts/bin/react-scripts.js');
const frontend = spawn(process.execPath, [reactScripts, 'start'], {
  cwd: root,
  env: frontendEnv,
  stdio: 'inherit',
  shell: false,
});

frontend.on('exit', (code) => {
  backend.kill();
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
