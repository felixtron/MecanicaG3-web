#!/usr/bin/env node
/**
 * Verifica que package-lock.json esté sincronizado con package.json.
 *
 * Motivo: el Dockerfile usa `npm ci --omit=dev`, que aborta ante cualquier
 * desincronización. Ese fue exactamente el fallo del commit 0437568 (drift de
 * axios), detectado solo cuando el build de producción ya había arrancado.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const res = spawnSync('npm', ['ci', '--dry-run', '--ignore-scripts'], {
  cwd: path.join(__dirname, '..'),
  encoding: 'utf8'
});

if (res.status !== 0) {
  console.error('\n✗ package-lock.json NO está sincronizado con package.json');
  console.error('  El build de Docker (`npm ci --omit=dev`) fallará.\n');
  console.error((res.stderr || res.stdout || '').trim().split('\n').slice(-15).join('\n'));
  console.error('\n  Solución:  npm install  &&  git add package-lock.json\n');
  process.exit(1);
}

console.log('✓ Lockfile sincronizado (npm ci pasa)');
