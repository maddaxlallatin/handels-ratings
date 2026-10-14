# Handels Ratings

A private scorebook for a Handel's crew. Pick your name once, and the browser keeps that cookie until you sign out.

## Homelab

```bash
docker compose up -d --build
```

Cloudflare Tunnel should point at `http://handels-ratings:3000` on `homelab-network`. The app is not published on a host port, because 3000 is often already taken.

Postgres data stays in the `postgres-data` volume. Review photos stay in the `uploads` volume. Set `SESSION_SECRET` in a `.env` file next to `docker-compose.yml` before anyone else can reach the app. Set `COOKIE_SECURE=true` if you serve it over HTTPS.

The flavor list is a static copy of [Handel's all flavors](https://handelsicecream.com/all-flavors/). Fan favorites start marked as scooping. Turn the rest on when your shop has them.

## Local development

```bash
docker compose up -d postgres
export DATABASE_URL=postgres://handels:handels@localhost:5433/handels
export SESSION_SECRET=dev
bunx prisma db migrate --yes
bun src/prisma/seed.ts
bun run dev
```
