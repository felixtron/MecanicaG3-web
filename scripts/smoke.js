#!/usr/bin/env node
/**
 * Smoke test: arranca el servidor real en un puerto efímero y verifica que
 * todas las rutas públicas rendericen. Detecta plantillas EJS rotas, locals
 * faltantes y crashes de arranque ANTES de que lleguen a producción.
 */
const { spawn } = require('child_process');
const path = require('path');

const PORT = Number(process.env.SMOKE_PORT || 3999);
const BASE = `http://127.0.0.1:${PORT}`;
const BOOT_TIMEOUT_MS = 20000;

const ROUTES = [
  '/',
  '/contacto',
  '/quienes-somos',
  '/tecnico-en-mecanica',
  '/registro',
  '/politica-de-privacidad',
  '/proximamente',
  '/nuestro-equipo'
];

const REDIRECTS = [
  ['/index.html', '/'],
  ['/contact.html', '/contacto'],
  ['/who-we-are.html', '/quienes-somos'],
  ['/our-team.html', '/nuestro-equipo'],
  ['/tecnicoenmecanica.html', '/tecnico-en-mecanica'],
  ['/registro.html', '/registro'],
  ['/politica_privacidad.html', '/politica-de-privacidad'],
  ['/coming-soon-1.html', '/proximamente'],
  ['/xabout-1.html', '/quienes-somos']
];

const failures = [];
let serverLog = '';

function fail(msg) {
  failures.push(msg);
  console.error(`  ✗ ${msg}`);
}

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

async function waitForBoot(deadline) {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return true;
    } catch (_) { /* aún no levanta */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function checkRoute(route) {
  const res = await fetch(`${BASE}${route}`, { redirect: 'manual' });
  if (res.status !== 200) {
    return fail(`${route} → HTTP ${res.status} (esperaba 200)`);
  }
  const html = await res.text();
  if (!html.includes('</html>')) {
    return fail(`${route} → HTML incompleto (¿render abortado?)`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) {
    return fail(`${route} → sin <title> (meta SEO perdida)`);
  }
  pass(`${route} → 200 (${(html.length / 1024).toFixed(0)} KB)`);
}

async function checkRedirect(from, to) {
  const res = await fetch(`${BASE}${from}`, { redirect: 'manual' });
  if (res.status !== 301) return fail(`${from} → HTTP ${res.status} (esperaba 301)`);
  const location = res.headers.get('location');
  if (location !== to) return fail(`${from} → redirige a "${location}" (esperaba "${to}")`);
  pass(`${from} → 301 ${to}`);
}

async function checkNotFound() {
  const res = await fetch(`${BASE}/esta-ruta-no-existe-jamas`);
  if (res.status !== 404) return fail(`404 handler → HTTP ${res.status} (esperaba 404)`);
  const html = await res.text();
  if (!html.includes('</html>')) return fail('404 handler → no renderiza la vista 404.ejs');
  pass('404 handler → 404 con vista renderizada');
}

async function checkStatic() {
  const res = await fetch(`${BASE}/css/style.css`);
  if (res.status !== 200) return fail(`/css/style.css → HTTP ${res.status} (assets estáticos rotos)`);
  pass('/css/style.css → 200 (estáticos servidos)');
}

async function main() {
  console.log(`\nSmoke test — arrancando servidor en ${BASE}\n`);

  // Si el puerto ya está ocupado, el servidor nuevo no arranca y el test falla
  // con un "no respondió en /health" que no dice nada. Suele pasar cuando una
  // corrida anterior quedó huérfana (por ejemplo al truncar su salida con
  // `head`, que cierra la tubería y deja el proceso vivo).
  try {
    const previo = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(1000) });
    if (previo.ok) {
      console.error(`✗ El puerto ${PORT} ya está ocupado por otro servidor.`);
      console.error(`  Ciérralo con:  lsof -ti :${PORT} | xargs kill`);
      console.error('  O usa otro puerto:  SMOKE_PORT=4001 npm run smoke');
      process.exit(1);
    }
  } catch {
    // Nadie responde: el puerto está libre, que es lo esperado.
  }

  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (d) => { serverLog += d; });
  server.stderr.on('data', (d) => { serverLog += d; });

  let exitedEarly = false;
  server.on('exit', (code) => {
    if (code !== null && code !== 0) exitedEarly = true;
  });

  const booted = await waitForBoot(Date.now() + BOOT_TIMEOUT_MS);

  if (!booted) {
    console.error(`\n✗ El servidor no respondió en /health tras ${BOOT_TIMEOUT_MS / 1000}s${exitedEarly ? ' (proceso murió)' : ''}`);
    console.error('--- salida del servidor ---');
    console.error(serverLog.trim() || '(sin salida)');
    server.kill('SIGKILL');
    process.exit(1);
  }

  try {
    console.log('Rutas:');
    for (const route of ROUTES) await checkRoute(route);

    console.log('\nRedirects 301 (URLs legacy .html):');
    for (const [from, to] of REDIRECTS) await checkRedirect(from, to);

    console.log('\nOtros:');
    await checkNotFound();
    await checkStatic();
  } catch (err) {
    fail(`Error inesperado: ${err.message}`);
  } finally {
    server.kill('SIGTERM');
    setTimeout(() => server.kill('SIGKILL'), 2000).unref();
  }

  if (failures.length) {
    console.error(`\n✗ Smoke test FALLÓ — ${failures.length} problema(s):`);
    failures.forEach((f) => console.error(`  · ${f}`));
    if (serverLog.trim()) {
      console.error('\n--- salida del servidor ---');
      console.error(serverLog.trim());
    }
    process.exit(1);
  }

  console.log(`\n✓ Smoke test OK — ${ROUTES.length} rutas, ${REDIRECTS.length} redirects, 404 y estáticos\n`);
  process.exit(0);
}

main();
