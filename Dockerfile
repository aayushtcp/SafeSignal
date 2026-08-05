# Lightweight multi-target image for Natural Disaster stack
# Targets: backend | frontend

# ---------- Backend ----------
FROM python:3.12-slim-bookworm AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libjpeg62-turbo \
        zlib1g \
        libffi8 \
    && rm -rf /var/lib/apt/lists/*

COPY dbackend/requirements.txt .
RUN grep -viE 'pytest' requirements.txt > /tmp/requirements.txt \
    && pip install --no-cache-dir -r /tmp/requirements.txt

COPY dbackend/ .
COPY docker/backend-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p media staticfiles

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "dbackend.asgi:application"]

# ---------- Frontend build ----------
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY dfrontend/package.json dfrontend/package-lock.json ./
RUN npm ci

COPY dfrontend/ .

ARG VITE_API_URL=http://127.0.0.1:8000/api
ARG VITE_API_URL_USER=http://127.0.0.1:8000/users
ARG VITE_WS_URL=ws://127.0.0.1:8000
ENV VITE_API_URL=$VITE_API_URL \
    VITE_API_URL_USER=$VITE_API_URL_USER \
    VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ---------- Frontend (nginx) ----------
FROM nginx:1.27-alpine AS frontend

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
