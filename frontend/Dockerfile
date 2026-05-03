ARG NODE_BASE_IMAGE=node:20-alpine
ARG NPM_REGISTRY=
ARG NPM_REGISTRY_FALLBACK=https://archive.ito.gov.ir/npm/
ARG ALPINE_MAIN_MIRROR=
ARG ALPINE_COMMUNITY_MIRROR=

FROM ${NODE_BASE_IMAGE} AS builder

ARG NPM_REGISTRY
ARG NPM_REGISTRY_FALLBACK
ARG ALPINE_MAIN_MIRROR
ARG ALPINE_COMMUNITY_MIRROR

WORKDIR /app

ENV NODE_ENV=development
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_TELEMETRY_DISABLED=1
ENV NPM_REGISTRY="${NPM_REGISTRY}"
ENV NPM_REGISTRY_FALLBACK="${NPM_REGISTRY_FALLBACK}"

COPY package*.json ./

RUN if [ -n "${ALPINE_MAIN_MIRROR}" ] || [ -n "${ALPINE_COMMUNITY_MIRROR}" ]; then \
      if [ -z "${ALPINE_MAIN_MIRROR}" ]; then \
        ALPINE_MAIN_MIRROR="${ALPINE_COMMUNITY_MIRROR}"; \
      fi; \
      if [ -z "${ALPINE_COMMUNITY_MIRROR}" ]; then \
        ALPINE_COMMUNITY_MIRROR="${ALPINE_MAIN_MIRROR}"; \
      fi; \
      awk -v main="${ALPINE_MAIN_MIRROR}" -v community="${ALPINE_COMMUNITY_MIRROR}" '{ if ($0 ~ /\/main$/) { sub(/https?:\/\/[^ ]+\/alpine/, main); } else if ($0 ~ /\/community$/) { sub(/https?:\/\/[^ ]+\/alpine/, community); } print; }' /etc/apk/repositories > /tmp/apk.repositories && \
      mv /tmp/apk.repositories /etc/apk/repositories; \
    fi

RUN set -eu; \
    PRIMARY_NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org/}"; \
    SECONDARY_NPM_REGISTRY="${NPM_REGISTRY_FALLBACK:-https://archive.ito.gov.ir/npm/}"; \
    npm config set registry "${PRIMARY_NPM_REGISTRY}"; \
    install_cmd="npm ci --include=dev"; \
    if [ ! -f package-lock.json ]; then \
      install_cmd="npm install"; \
    fi; \
    if ! sh -c "${install_cmd}"; then \
      if [ "${SECONDARY_NPM_REGISTRY}" != "${PRIMARY_NPM_REGISTRY}" ]; then \
        npm config set registry "${SECONDARY_NPM_REGISTRY}"; \
        sh -c "${install_cmd}"; \
      elif [ "${PRIMARY_NPM_REGISTRY}" != "https://registry.npmjs.org/" ]; then \
        npm config set registry "https://registry.npmjs.org/"; \
        sh -c "${install_cmd}"; \
      else \
        exit 1; \
      fi; \
    fi

COPY . .

RUN npm run prep-images
RUN npm run build

FROM ${NODE_BASE_IMAGE} AS runner

ARG NPM_REGISTRY
ARG NPM_REGISTRY_FALLBACK
ARG ALPINE_MAIN_MIRROR
ARG ALPINE_COMMUNITY_MIRROR

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NUXT_TELEMETRY_DISABLED=1
ENV NPM_REGISTRY="${NPM_REGISTRY}"
ENV NPM_REGISTRY_FALLBACK="${NPM_REGISTRY_FALLBACK}"

COPY package*.json ./

RUN if [ -n "${ALPINE_MAIN_MIRROR}" ] || [ -n "${ALPINE_COMMUNITY_MIRROR}" ]; then \
      if [ -z "${ALPINE_MAIN_MIRROR}" ]; then \
        ALPINE_MAIN_MIRROR="${ALPINE_COMMUNITY_MIRROR}"; \
      fi; \
      if [ -z "${ALPINE_COMMUNITY_MIRROR}" ]; then \
        ALPINE_COMMUNITY_MIRROR="${ALPINE_MAIN_MIRROR}"; \
      fi; \
      awk -v main="${ALPINE_MAIN_MIRROR}" -v community="${ALPINE_COMMUNITY_MIRROR}" '{ if ($0 ~ /\/main$/) { sub(/https?:\/\/[^ ]+\/alpine/, main); } else if ($0 ~ /\/community$/) { sub(/https?:\/\/[^ ]+\/alpine/, community); } print; }' /etc/apk/repositories > /tmp/apk.repositories && \
      mv /tmp/apk.repositories /etc/apk/repositories; \
    fi

RUN set -eu; \
    PRIMARY_NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org/}"; \
    SECONDARY_NPM_REGISTRY="${NPM_REGISTRY_FALLBACK:-https://archive.ito.gov.ir/npm/}"; \
    npm config set registry "${PRIMARY_NPM_REGISTRY}"; \
    install_cmd="npm ci --omit=dev"; \
    if [ ! -f package-lock.json ]; then \
      install_cmd="npm install --omit=dev"; \
    fi; \
    if ! sh -c "${install_cmd}"; then \
      if [ "${SECONDARY_NPM_REGISTRY}" != "${PRIMARY_NPM_REGISTRY}" ]; then \
        npm config set registry "${SECONDARY_NPM_REGISTRY}"; \
        sh -c "${install_cmd}"; \
      elif [ "${PRIMARY_NPM_REGISTRY}" != "https://registry.npmjs.org/" ]; then \
        npm config set registry "https://registry.npmjs.org/"; \
        sh -c "${install_cmd}"; \
      else \
        exit 1; \
      fi; \
    fi

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

EXPOSE 3000

# Ensure curl and CA certs are available for healthchecks and runtime needs
RUN apk add --no-cache curl ca-certificates

# Ensure runtime does not run as root. Use the official `node` user present
# in the base image and make `/app` writable by that user.
RUN chown -R node:node /app || true

USER node

CMD ["node", ".output/server/index.mjs"]
