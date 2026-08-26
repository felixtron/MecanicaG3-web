# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodeapp
COPY --from=deps --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs . .
USER nodeapp
EXPOSE 3000

# Sirve para `docker run` local y para el job de CI que levanta la imagen.
#
# En producción NO basta: la imagen se publica en GHCR con media types OCI y el
# spec OCI no tiene campo Healthcheck, así que BuildKit lo descarta al exportar.
# El healthcheck que vale en el servidor es el `HealthCmd=` del Quadlet
# (deploy/g3web.container) — sin él, `podman auto-update` no detecta un rollout
# roto y no hay reinicio automático real.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
