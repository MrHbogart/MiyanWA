ARG PYTHON_BASE_IMAGE=python:3.12-slim
ARG DEBIAN_MIRROR=
ARG DEBIAN_SECURITY_MIRROR=
ARG APT_DISABLE_VALID_UNTIL=false
ARG PIP_INDEX_URL=https://pypi.org/simple
ARG PIP_EXTRA_INDEX_URL=
ARG PIP_TRUSTED_HOSTS=

FROM ${PYTHON_BASE_IMAGE} AS builder

ARG PIP_INDEX_URL
ARG PIP_EXTRA_INDEX_URL
ARG PIP_TRUSTED_HOSTS

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VENV_PATH="/opt/venv" \
    PIP_INDEX_URL="${PIP_INDEX_URL}" \
    PIP_EXTRA_INDEX_URL="${PIP_EXTRA_INDEX_URL}" \
    PIP_TRUSTED_HOSTS="${PIP_TRUSTED_HOSTS}"

WORKDIR /app

RUN python -m venv ${VENV_PATH}
ENV PATH="${VENV_PATH}/bin:${PATH}"

COPY backend/requirements.txt ./requirements.txt
RUN set -eu; \
    PIP_INDEX_URL="${PIP_INDEX_URL:-https://pypi.org/simple}"; \
    set -- --index-url "${PIP_INDEX_URL}"; \
    if [ -n "${PIP_EXTRA_INDEX_URL}" ]; then \
      set -- "$@" --extra-index-url "${PIP_EXTRA_INDEX_URL}"; \
    fi; \
    if [ -n "${PIP_TRUSTED_HOSTS}" ]; then \
      for host in ${PIP_TRUSTED_HOSTS}; do \
        set -- "$@" --trusted-host "${host}"; \
      done; \
    fi; \
    pip install --upgrade pip "$@"; \
    pip install --no-cache-dir -r requirements.txt "$@"

FROM ${PYTHON_BASE_IMAGE} AS final

ARG DEBIAN_MIRROR
ARG DEBIAN_SECURITY_MIRROR
ARG APT_DISABLE_VALID_UNTIL
ARG PIP_INDEX_URL
ARG PIP_EXTRA_INDEX_URL
ARG PIP_TRUSTED_HOSTS

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings \
    VENV_PATH="/opt/venv" \
    APP_USER="django" \
    APP_HOME="/home/django" \
    PIP_INDEX_URL="${PIP_INDEX_URL}" \
    PIP_EXTRA_INDEX_URL="${PIP_EXTRA_INDEX_URL}" \
    PIP_TRUSTED_HOSTS="${PIP_TRUSTED_HOSTS}"

WORKDIR /app

RUN set -eux; \
    if [ -n "${DEBIAN_MIRROR}" ] || [ -n "${DEBIAN_SECURITY_MIRROR}" ]; then \
      for source_file in /etc/apt/sources.list /etc/apt/sources.list.d/*.list /etc/apt/sources.list.d/*.sources; do \
        [ -f "$source_file" ] || continue; \
        if [ -n "${DEBIAN_SECURITY_MIRROR}" ]; then \
          sed -i "s|http://security.debian.org/debian-security|${DEBIAN_SECURITY_MIRROR}|g; s|https://security.debian.org/debian-security|${DEBIAN_SECURITY_MIRROR}|g; s|http://deb.debian.org/debian-security|${DEBIAN_SECURITY_MIRROR}|g; s|https://deb.debian.org/debian-security|${DEBIAN_SECURITY_MIRROR}|g" "$source_file"; \
        fi; \
        if [ -n "${DEBIAN_MIRROR}" ]; then \
          sed -i "s|http://deb.debian.org/debian|${DEBIAN_MIRROR}|g; s|https://deb.debian.org/debian|${DEBIAN_MIRROR}|g" "$source_file"; \
        fi; \
      done; \
    fi; \
    if [ "${APT_DISABLE_VALID_UNTIL}" = "true" ]; then \
      printf 'Acquire::Check-Valid-Until "false";\nAcquire::Check-Date "false";\n' > /etc/apt/apt.conf.d/99no-check-valid-until; \
    fi; \
    apt-get update && \
    apt-get install -y --no-install-recommends gosu curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder ${VENV_PATH} ${VENV_PATH}
ENV PATH="${VENV_PATH}/bin:${PATH}"

## Copy only the backend app files from the repository root into /app. When the
## build context is the repository root (we changed that in compose), a plain
## `COPY . .` would place files under /app including a `backend/` folder,
## which breaks paths expected by the entrypoint. Copy the backend dir content
## into /app so files like `docker-entrypoint.sh` live at /app/docker-entrypoint.sh
COPY backend/ .

RUN set -eux; \
    groupadd --system "${APP_USER}" || true; \
    useradd --system --gid "${APP_USER}" --home "${APP_HOME}" --shell /bin/bash "${APP_USER}" || true; \
    mkdir -p "${APP_HOME}" /app/staticfiles /app/media; \
    chown -R "${APP_USER}:${APP_USER}" "${APP_HOME}" /app "${VENV_PATH}"; \
    chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--log-file", "-"]
