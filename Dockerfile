FROM node:24-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_GA_ID=""
ARG NEXT_PUBLIC_META_PIXEL_ID=""
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN groupadd --system --gid 1001 wzni && useradd --system --uid 1001 --gid wzni wzni
COPY --from=build --chown=wzni:wzni /app/.next/standalone ./
COPY --from=build --chown=wzni:wzni /app/.next/static ./.next/static
COPY --from=build --chown=wzni:wzni /app/public ./public
RUN mkdir -p /app/data/uploads && chown -R wzni:wzni /app/data
USER wzni
EXPOSE 3000
CMD ["node","server.js"]

FROM build AS migration
ENV NODE_ENV=production
CMD ["sh","-c","npx prisma migrate deploy && npx prisma db seed"]
