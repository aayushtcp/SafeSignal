#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "========================================"
echo " Natural Disaster — Docker deployment"
echo "========================================"

# Ensure sqlite file exists so the bind mount is a file, not a directory
if [[ ! -f ./dbackend/db.sqlite3 ]]; then
  echo "==> Creating empty SQLite database file..."
  touch ./dbackend/db.sqlite3
fi

mkdir -p ./dbackend/media

if [[ ! -f ./dbackend/.env ]]; then
  echo "ERROR: ./dbackend/.env is missing."
  echo "Create it with at least SECRET_KEY=..."
  exit 1
fi

FIREBASE_JSON="./dbackend/api/static/safesignal-db902-firebase-adminsdk-fbsvc-8ccbec998e.json"
if [[ ! -f "$FIREBASE_JSON" ]]; then
  echo "WARNING: Firebase credentials not found at:"
  echo "  $FIREBASE_JSON"
  echo "Backend may fail to start until this file is present."
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed or not in PATH."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "ERROR: docker compose is not available."
  exit 1
fi

echo "==> Building and starting containers..."
"${COMPOSE[@]}" down --remove-orphans
"${COMPOSE[@]}" up --build -d

echo ""
echo "==> Waiting for backend health..."
for i in $(seq 1 40); do
  if "${COMPOSE[@]}" ps --status running | grep -q nd-backend \
    && curl -sf "http://127.0.0.1:8000/admin/login/" >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [[ "$i" -eq 40 ]]; then
    echo "Backend did not become ready in time. Recent logs:"
    "${COMPOSE[@]}" logs --tail=80 backend
    exit 1
  fi
done

echo ""
echo "========================================"
echo " Stack is up"
echo "----------------------------------------"
echo " Frontend:  http://127.0.0.1:3000"
echo " Backend:   http://127.0.0.1:8000"
echo " Admin:     http://127.0.0.1:8000/admin/"
echo "========================================"
echo ""
echo "Useful commands:"
echo "  ${COMPOSE[*]} logs -f"
echo "  ${COMPOSE[*]} down"
echo ""

"${COMPOSE[@]}" ps
