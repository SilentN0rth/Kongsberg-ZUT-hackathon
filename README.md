# WatchBrief

Monorepo: dwa niezależne projekty, które łączy wyłącznie REST API.

| Katalog | Co | Narzędzie |
|---|---|---|
| `frontend/` | Next.js 16, HeroUI, Dexie (PWA offline) | pnpm |
| `backend/` | Spring Boot 3, Java 21, JPA | Maven |

## Uruchomienie

```bash
pnpm dev:api    # backend na :8080 (lokalna baza H2 w backend/data)
pnpm dev:web    # frontend na :3000, /api/* przekierowane na backend
pnpm test:api   # testy backendu
```

Na statku (sieć lokalna, bez internetu): `./scripts/start-backend.sh` albo `scripts\start-backend.bat`; szczegóły w sekcji „Wdrożenie” w `PLAN.md`.

Frontend: `cd frontend && pnpm install`. Konfiguracja: `frontend/.env.example`, `backend/.env.example`.
Plan i kontrakt API: `PLAN.md`.
