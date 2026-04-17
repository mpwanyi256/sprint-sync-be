FROM node:20-bookworm-slim AS builder

WORKDIR /app

ENV HUSKY=0

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./

RUN corepack enable && yarn install --frozen-lockfile

COPY . .

RUN yarn build:prod \
  && yarn install --frozen-lockfile --production=true \
  && yarn cache clean

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home nodeuser

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/keys ./keys

# Copy keys to root for production - use example files as fallback if they exist
RUN if [ -f /app/keys/private.pem ]; then cp /app/keys/private.pem /app/private.pem; else cp /app/keys/private.pem.example /app/private.pem 2>/dev/null || true; fi && \
  if [ -f /app/keys/public.pem ]; then cp /app/keys/public.pem /app/public.pem; else cp /app/keys/public.pem.example /app/public.pem 2>/dev/null || true; fi

RUN mkdir -p /app/logs && chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "-r", "module-alias/register", "-r", "dotenv/config", "build/server.js"]
