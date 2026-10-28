FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
# "/" makes the browser call relative /api/... URLs, so one reverse proxy serves both the UI and the API.
# NEXT_PUBLIC_* values are inlined at build time, so a different API host needs a rebuild.
ARG NEXT_PUBLIC_API_BASE_URL=/
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=6 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1
CMD ["node", "server.js"]
