FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=80

COPY --from=build /app/dist ./dist
COPY scripts ./scripts
COPY src/lib/attribution.mjs ./src/lib/attribution.mjs
COPY src/lib/lead-fields.mjs ./src/lib/lead-fields.mjs

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/_health || exit 1

CMD ["node", "scripts/serve.mjs"]
