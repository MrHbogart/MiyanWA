FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./

RUN NODE_ENV=development npm ci

COPY . .

RUN npm run prep-images
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NUXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

EXPOSE 3000

# Ensure curl and CA certs are available for healthchecks and runtime needs
RUN apk add --no-cache curl ca-certificates

# Ensure runtime does not run as root. Use the official `node` user present
# in the base image and make `/app` writable by that user.
RUN chown -R node:node /app || true

USER node

CMD ["npm", "run", "start"]
