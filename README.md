# WatchBrief

Monorepo: dwa niezależne projekty, które łączy wyłącznie REST API.

| Katalog | Co | Narzędzie |
|---|---|---|
| `frontend/` | Next.js 16, HeroUI, Dexie (PWA offline) | pnpm |
| `backend/` | Spring Boot 3, Java 21, JPA | Maven |

## Uruchomienie

```bash
pnpm dev:api    # backend na :8080 (bez DATABASE_URL używa lokalnego H2)
pnpm dev:web    # frontend na :3000, /api/* przekierowane na backend
pnpm test:api   # testy backendu
```

Frontend: `cd frontend && pnpm install`. Konfiguracja: `frontend/.env.example`, `backend/.env.example`.
Plan i kontrakt API: `PLAN.md`.
