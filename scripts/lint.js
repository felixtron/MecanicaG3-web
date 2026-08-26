#!/usr/bin/env node
/**
 * Verificación de sintaxis sin dependencias externas:
 *  - node --check sobre todo el JS del servidor (server.js, src/, scripts/)
 *  - compilación de todas las plantillas EJS (incluye los partials via include)
 *
 * Acepta rutas como argumentos para revisar solo un subconjunto
 * (lo usa el hook pre-commit con los archivos en stage).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ejs = require('ejs');

const ROOT = path.join(__dirname, '..');
const JS_ROOTS = ['server.js', 'ecosystem.config.js', 'src', 'scripts'];
const VIEWS_DIR = path.join(ROOT, 'views');

const errors = [];

function walk(dir, ext, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, acc);
    else if (entry.name.endsWith(ext)) acc.push(full);
  }
  return acc;
}

function collectTargets(args) {
  if (args.length) {
    const files = args.map((f) => path.resolve(ROOT, f)).filter((f) => fs.existsSync(f));
    return {
      js: files.filter((f) => f.endsWith('.js')),
      ejs: files.filter((f) => f.endsWith('.ejs'))
    };
  }
  const js = [];
  for (const target of JS_ROOTS) {
    const full = path.join(ROOT, target);
    if (!fs.existsSync(full)) continue;
    if (fs.statSync(full).isDirectory()) walk(full, '.js', js);
    else js.push(full);
  }
  return { js, ejs: walk(VIEWS_DIR, '.ejs') };
}

function checkJs(file) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    errors.push(`${path.relative(ROOT, file)}\n${(err.stderr || '').toString().trim()}`);
  }
}

function checkEjs(file) {
  try {
    // filename permite resolver los <%- include('partials/...') %>
    ejs.compile(fs.readFileSync(file, 'utf8'), { filename: file, views: [VIEWS_DIR] });
  } catch (err) {
    errors.push(`${path.relative(ROOT, file)}\n  ${err.message.split('\n').slice(0, 6).join('\n  ')}`);
  }
}

const { js, ejs: templates } = collectTargets(process.argv.slice(2));

js.forEach(checkJs);
templates.forEach(checkEjs);

if (errors.length) {
  console.error(`\n✗ Lint FALLÓ — ${errors.length} archivo(s) con errores de sintaxis:\n`);
  errors.forEach((e) => console.error(`  ${e}\n`));
  process.exit(1);
}

console.log(`✓ Lint OK — ${js.length} archivo(s) JS, ${templates.length} plantilla(s) EJS`);
