#!/bin/sh
set -eu

attempt=0
until bunx prisma db migrate --yes; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Database migration failed." >&2
    exit 1
  fi
  echo "Waiting for Postgres..."
  sleep 2
done

bun src/prisma/seed.ts
exec bun run start -- -H 0.0.0.0 -p "${PORT:-3000}"
