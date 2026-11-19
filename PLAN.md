# WatchBrief – plan realizacji

Źródło konceptu: artefakt „WatchBrief Podsumowanie” (https://claude.ai/artifact/RxRvMD868cfg8HcjpZtoXW).
Zdanie główne: *2 minuty. Zero zgubionych usterek.* Zasada: dopóki MUST nie działa od początku do końca, nikt nie dotyka SHOULD.

## Stan repo (zrobione)

- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind 4, pnpm.
- Payload 3 (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/ui`, `graphql`, `sharp`).
- HeroUI v3 (`@heroui/react`, `@heroui/styles`).
- Offline/PWA: `dexie`, `serwist`; QR: `qrcode` (+ `@types/qrcode`).
- Brak Dockera, brak konfiguracji Payload, brak kodu aplikacji (tylko szablon create-next-app).
- Uwaga: `.gitignore` ignoruje `.env*` – dodać wyjątek `!.env.example`.

## Zmiany względem konceptu

| Koncept | Teraz | Skutek |
|---|---|---|
| Upstash Redis jako magazyn | Postgres + Payload | Zgłoszenia, urządzenia, zdjęcia to kolekcje Payload; „Skrzynka serwisu” może być panelem admina lub własnym widokiem na REST API |
| Własny route handler sync | REST API Payload (`/api/...`) lub jeden custom endpoint | Mniej kodu; kolejka z Dexie wysyła `POST` po powrocie sieci |
| Tailwind | Tailwind 4 + HeroUI v3 | Duże kafle pod rękawice z komponentów HeroUI, Night Mode przez tokeny |

## Otwarte decyzje (do zamknięcia w Etapie 0)

1. **Baza Postgres bez Dockera:** Neon / Supabase / Vercel Postgres (hosted, rekomendowane na hackathon) albo lokalny Postgres z Homebrew. Potrzebny `DATABASE_URL`.
2. **Hosting:** Vercel (HTTPS wymagane przez service worker).
3. **Zdjęcia:** Payload `media` + storage (Vercel Blob / `@payloadcms/storage-vercel-blob`) – lokalny dysk nie działa na serverless.
4. **Serwist z Next 16/Turbopack:** sprawdzić, czy wystarczy `serwist` + własny `sw.ts`, czy dołożyć `@serwist/turbopack`.
5. **Podział ról:** kto kod, kto treści i pitch.

## Skille do użycia (znalezione `npx skills find`, jeszcze NIE zainstalowane)

| Obszar | Skill | Instalacje |
|---|---|---|
| Payload CMS | `payloadcms/payload@payload` | 2.8K |
| HeroUI v3 | `heroui-inc/heroui@heroui-react` | 12.9K |
| Next.js | `vercel-labs/openreview@next-best-practices` | 6.9K |
| Postgres | `supabase/agent-skills@supabase-postgres-best-practices` | 491K |
| PWA offline (opcjonalnie) | `agents-inc/skills@web-pwa-offline-first` | 154 (mało – przejrzeć przed instalacją) |

Instalacja: `npx skills add <owner/repo@skill>` (np. `npx skills add payloadcms/payload@payload`).
Skille wewnętrzne już dostępne: `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:test-driven-development`, `impeccable`, `mobile-native`, `emil-design-eng`.

## Etapy

Budżet: 10 h hackathonu. Bramki (🚩/🧊) z konceptu zostają.

### Etap 0 – Fundament (0:00–0:30)
- Zamrożenie sceny, nazwy i modelu danych: `src/types.ts` (Usterka, Wpis, Brief, Zgłoszenie, Urządzenie).
- Decyzje z listy wyżej; utworzenie bazy, `.env.example` (`DATABASE_URL`, `PAYLOAD_SECRET`).
- Zainstalować skille.

### Etap 1 – Szkielet i test ryzyka (0:30–1:30)
- Konfiguracja Payload w Next (`payload.config.ts`, `withPayload`, trasy `(payload)`), adapter Postgres, migracje.
- Kolekcje: `devices` (sektor, id, nr seryjny), `symptoms`, `reports` (urządzenie, objaw, priorytet, zdjęcie, czas, status), `handovers`, `media`.
- Seed: 8–12 urządzeń, 5–6 wpisów (1 krytyczny), wzorcowy brief.
- HeroUI + Tailwind: motyw, Night Mode (czerwono-czarny) jako tokeny.
- **Test krytyczny na prawdziwym telefonie:** telefon ↔ Vercel ↔ laptop, service worker, otwarcie `/nowa?sektor=A&urzadzenie=pompa-03` bez sieci.

### Etap 2 – MUST: przepływ usterki (1:30–4:00)
- Ekran „Nowa obserwacja”: zdjęcie (`input capture` + kompresja canvas), kafle urządzenie/objaw/priorytet.
- IndexedDB (Dexie): zapis lokalny, kolejka, licznik „Offline: N wpisów czeka”.
- Wysyłka kolejki po powrocie sieci do Payload; lista wpisów „Moja wachta”.
- 🚩 **4:00 checkpoint:** usterka offline → sync → widoczna na laptopie. Jeśli nie, upraszczamy do „Symuluj połączenie”.

### Etap 3 – MUST: handover i skrzynka (4:00–6:30)
- Generator Handover Brief z szablonów (bez LLM).
- Ekran zmiennika, przycisk „Przejmuję wachtę”.
- Skrzynka serwisu na laptopie: odpytywanie co ok. 2 s lub panel Payload.
- Testy w trybie samolotowym.

### Etap 4 – SHOULD (6:30–7:30)
- Autouzupełnianie z linku QR/NFC (walidacja parametrów względem `devices`), strona z kodami do wydruku (`qrcode`).
- Odhaczanie punktów briefu, Night Mode, „Reset demo”, plan B „Symuluj skan”.
- 🧊 **7:30 feature freeze.**

### Etap 5 – Polerowanie i oddanie (7:30–10:00)
- Stabilność, README (zdanie główne, scenariusz, architektura, uruchomienie, link do wdrożenia), `.env.example`, czyste commity.
- COULD tylko jeśli zostanie czas: eksport PDF.
- 3 pełne próby ze stoperem, wideo zapasowe 60–90 s, bufor.

## Poza zakresem (NIE)
Głos, czat z manualami (RAG), logowanie i profile, prawdziwe czujniki i integracje, zastępowanie dziennika okrętowego, „wellbeing”.
