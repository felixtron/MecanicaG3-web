# G3Web — mecanicag3.com

Sitio de la **Escuela de Mecánica Automotriz G3** (Toluca, Estado de México).
Express 4 + EJS, desplegado en Dokploy sobre Docker Swarm.

- Producción: <https://mecanicag3.com>
- Repositorio: <https://github.com/felixtron/MecanicaG3-web>

---

## Arranque local

```bash
nvm use            # Node 22 (ver .nvmrc)
npm install        # instala deps y activa los git hooks
cp .env.example .env
npm run dev        # http://localhost:3000
```

`npm install` ejecuta el script `prepare`, que apunta `core.hooksPath` a
`.githooks/`. Si clonaste el repo y los hooks no corren:

```bash
npm run hooks:install
```

---

## Flujo de trabajo

`main` está protegida por CI y **cada merge despliega a producción**. El trabajo
va en ramas:

```bash
git checkout -b feat/nombre-corto
# … cambios …
git add -A
git commit -m "feat(registro): agrega modalidad sabatina"
git push -u origin feat/nombre-corto
gh pr create --fill
```

Cuando el CI del PR está en verde, se hace merge y el deploy sale solo.

### Qué se valida y cuándo

| Momento | Qué corre | Duración |
|---|---|---|
| `git commit` (`pre-commit`) | archivos `.env` y claves privadas, patrones de secretos, archivos > 2 MB, marcadores de conflicto, sintaxis de JS/EJS en stage, sincronía del lockfile | ~1 s |
| `git commit` (`commit-msg`) | formato Conventional Commits, asunto ≤ 72 caracteres | instantáneo |
| `git push` (`pre-push`) | `npm run check` completo | ~10 s |
| Pull request (CI) | checks + build de la imagen Docker + `/health` dentro del contenedor | ~2 min |
| Merge a `main` (CI) | lo anterior y, solo si todo pasa, deploy a Dokploy + verificación de `https://mecanicag3.com/health` | ~4 min |

Para saltar los hooks en una emergencia: `git commit --no-verify` /
`git push --no-verify`. El CI **no** se puede saltar.

### Formato de commits

```
tipo(alcance): descripción en imperativo
```

Tipos: `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `test`, `build`,
`ci`, `chore`, `deploy`, `seo`, `content`.

```
feat(contacto): agrega campo de teléfono al formulario
fix(api): valida reCAPTCHA solo cuando el secret está configurado
seo(home): corrige meta description duplicada
build: sube la imagen base a node:22-alpine
```

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor con recarga automática (nodemon) |
| `npm start` | servidor en modo producción |
| `npm run lint` | `node --check` sobre el JS + compila todas las plantillas EJS |
| `npm run check:lockfile` | verifica que `npm ci` no falle (el build de Docker depende de esto) |
| `npm run smoke` | arranca el servidor y prueba las 8 rutas, los 9 redirects 301, el 404 y los estáticos |
| `npm run check` | los tres anteriores en orden |

---

## Estructura

```
server.js              app Express, middleware, /health, 404 y error handler
src/routes/pages.js    8 páginas públicas + redirects 301 desde las URLs .html legacy
src/routes/api.js      POST /api/contact y POST /api/subscribe
src/middleware/        helmet, CORS, rate limiting
src/services/          mailer (SMTP) y mailchimp
views/                 plantillas EJS (partials en views/partials/)
public/                CSS, JS, imágenes, fuentes y plugins del tema
scripts/               lint, smoke test y verificación del lockfile
.githooks/             pre-commit, commit-msg, pre-push
```

`public_html/` y `mg3bkp.zip` son el sitio PHP original: quedan fuera de git y
fuera de la imagen Docker.

---

## Variables de entorno

Ver `.env.example`. En producción se administran desde el panel de Dokploy
(pestaña *Environment*), no desde el repositorio.

`RECAPTCHA_SITE_KEY` es opcional: si no está definida, el formulario de contacto
funciona sin reCAPTCHA.

---

## Deploy

Automático al hacer merge a `main`, y **solo si el CI pasa**. El job `deploy`
llama a la API de Dokploy y luego verifica que producción responda.

Deploy manual (por ejemplo tras cambiar variables de entorno):

- Actions → *CI* → **Run workflow** sobre `main`, o
- botón **Deploy** en el panel de Dokploy.

Requiere el secret `DOKPLOY_TOKEN` en GitHub (Settings → Secrets and variables →
Actions).
