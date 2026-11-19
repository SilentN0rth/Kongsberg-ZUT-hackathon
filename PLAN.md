# WatchBrief – plan realizacji

Źródło konceptu: artefakt „WatchBrief Podsumowanie” (https://claude.ai/artifact/RxRvMD868cfg8HcjpZtoXW).
Zdanie główne: *2 minuty. Zero zgubionych usterek.* Zasada: dopóki MUST nie działa od początku do końca, nikt nie dotyka SHOULD.

## Struktura repo (monorepo, dwa niezależne projekty)

```
/
├── frontend/   Next.js 16 + HeroUI + Dexie (pnpm; wszystko co dotyczy TS/React)
├── backend/    Spring Boot 3, Java 21 (Maven; wszystko co dotyczy Javy)
├── PLAN.md, README.md, HACKATHON_SUMMARY.md
└── package.json  (tylko skróty: dev:web, dev:api, build:web, test:api)
```
Projekty nie współdzielą plików konfiguracyjnych ani zależności. Łączy je tylko REST: Next przepisuje `/api/*` na `BACKEND_URL` (`frontend/next.config.ts`).

## Stan repo (zrobione)

- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind 4, pnpm.
- Backend: **Spring Boot 3 (Java 21, Maven) w `backend/`** – JPA + Postgres (lokalnie H2), zamiast Payload CMS. Gotowe: encje, REST API, generator briefu, seed, test integracyjny.
- HeroUI v3 (`@heroui/react`, `@heroui/styles`).
- Offline/PWA: `dexie`, `serwist`; QR: `qrcode` (+ `@types/qrcode`).
- Frontend: brak kodu aplikacji (tylko szablon create-next-app); `frontend/next.config.ts` przepisuje `/api/*` na backend (`BACKEND_URL`).
- Backend uruchamiany lokalnie na komputerze mostka (`scripts/start-backend.*`); `Dockerfile` jest opcjonalny.
- Uwaga: `.gitignore` ignoruje `.env*` – dodać wyjątek `!.env.example`.

## Zmiany względem konceptu

| Koncept | Teraz | Skutek |
|---|---|---|
| Upstash Redis jako magazyn | Postgres + Spring Boot (Java) | Zgłoszenia, urządzenia, brief to encje JPA; „Skrzynka serwisu” to własny widok w Next odpytujący `GET /api/reports?since=` |
| Własny route handler sync | `POST /api/reports` w Springu (idempotentne po `id` z klienta) | Kolejka z Dexie wysyła `POST` po powrocie sieci; powtórka nie duplikuje wpisu |
| Tailwind | Tailwind 4 + HeroUI v3 | Duże kafle pod rękawice z komponentów HeroUI, Night Mode przez tokeny |

## Otwarte decyzje (do zamknięcia w Etapie 0)

1. **Baza:** lokalna H2 w pliku (bez instalacji, bez internetu); Postgres tylko opcjonalnie (wtedy `DATABASE_URL`).
2. **Hosting:** brak chmury – wszystko na komputerze na mostku w sieci lokalnej (sekcja „Wdrożenie” niżej).
3. **Zdjęcia:** nie robimy – backend ich nie przechowuje (tylko urządzenie, objaw, priorytet i notatka tekstowa).
4. **Serwist z Next 16/Turbopack:** sprawdzić, czy wystarczy `serwist` + własny `sw.ts`, czy dołożyć `@serwist/turbopack`.
5. **Podział ról:** kto kod, kto treści i pitch.

## Skille do użycia (znalezione `npx skills find`, jeszcze NIE zainstalowane)

| Obszar | Skill | Instalacje |
|---|---|---|
| Spring Boot / Java | do znalezienia (`npx skills find spring boot`) | – |
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
- ✅ Backend Spring Boot (`backend/`): encje `Device`, `Report`, `Handover`, seed 10 urządzeń + 5 wpisów (1 krytyczny), brief z szablonu, `POST /api/demo/reset`.
- Do zrobienia: wdrożenie backendu (Docker + Postgres) i podpięcie `BACKEND_URL`.
- HeroUI + Tailwind: motyw, Night Mode (czerwono-czarny) jako tokeny.
- **Test krytyczny na prawdziwym telefonie:** skaner ↔ komputer mostka w sieci lokalnej, service worker, otwarcie `/nowa?sektor=A&urzadzenie=pompa-03` bez sieci.

### Etap 2 – MUST: przepływ usterki (1:30–4:00)
- Ekran „Nowa obserwacja”: kafle urządzenie/objaw/priorytet.
- IndexedDB (Dexie): zapis lokalny, kolejka, licznik „Offline: N wpisów czeka”.
- Wysyłka kolejki po powrocie sieci na `POST /api/reports`; lista wpisów „Moja wachta”.
- 🚩 **4:00 checkpoint:** usterka offline → sync → widoczna na laptopie. Jeśli nie, upraszczamy do „Symuluj połączenie”.

### Etap 3 – MUST: handover i skrzynka (4:00–6:30)
- Generator Handover Brief z szablonów (bez LLM).
- Ekran zmiennika, przycisk „Przejmuję wachtę”.
- Skrzynka serwisu na laptopie: odpytywanie `GET /api/reports?since=` co ok. 2 s.
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

## API backendu (`backend/`)

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/devices`, `/api/devices/{id}` | Lista/walidacja urządzeń (slug z linku QR) |
| POST | `/api/reports` | Nowe zgłoszenie `{id, deviceId, symptom, priority: LOW/MEDIUM/CRITICAL, note?, createdAt?}`; idempotentne po `id` |
| GET | `/api/reports[?since=ISO]` | Lista zgłoszeń (skrzynka serwisu, „Moja wachta”) |
| PATCH | `/api/reports/{id}/status` | `NEW` / `ACKNOWLEDGED` / `RESOLVED` |
| POST | `/api/handover/brief` | Generuje i zapisuje Handover Brief |
| GET | `/api/handover/latest` | Ostatni brief (204 gdy brak) |
| POST | `/api/handover/{id}/take` | „Przejmuję wachtę” |
| POST | `/api/demo/reset` | Reset do scenariusza `basic` |
| GET | `/api/demo/scenarios` | Lista scenariuszy demo |
| POST | `/api/demo/scenarios/{name}` | Wyczyść dane i załaduj scenariusz: `basic`, `quiet`, `busy`, `critical` |
| POST | `/api/demo/simulate?count=1..20` | Dodaj losowe zgłoszenia „ze skanerów” (do pokazu skrzynki serwisu na żywo) |

Uruchomienie: `pnpm dev:api` (port 8080) i `pnpm dev:web` (port 3000) z korzenia repo.

## Wdrożenie: sieć lokalna statku, bez internetu

Założenie: na statku nie ma internetu, jest tylko sieć lokalna (Wi-Fi/LAN). Backend z bazą H2 w pliku działa na komputerze na mostku; skanery łączą się z nim po adresie IP.

```
skaner (Android, przeglądarka) ──Wi-Fi/LAN──► komputer na mostku: backend :8080 (+ frontend :3000)
```

**Komputer na mostku – wymagania:** Java 21 (JRE). Maven i Node tylko do budowania; gotowy `watchbrief-backend-0.1.0.jar` wystarczy skopiować i uruchomić.

**Start backendu**
- Linux/macOS: `./scripts/start-backend.sh`, Windows: `scripts\start-backend.bat` (przy pierwszym uruchomieniu zbudują jar).
- Albo ręcznie: `java -jar watchbrief-backend-0.1.0.jar`.
- Po starcie w logu pojawią się adresy typu `http://192.168.x.x:8080/api/health` – pod nie podłączają się skanery. Sprawdź to z innego urządzenia w tej samej sieci.
- Zapora systemowa musi przepuszczać port 8080 (i 3000 dla frontendu).

**Dane:** plik `backend/data/watchbrief.mv.db` (zmiana katalogu: zmienna `DATA_DIR`). Kopia zapasowa = skopiowanie tego pliku przy zatrzymanym backendzie. Reset danych demo: `POST /api/demo/reset`.

**Frontend w sieci lokalnej:** `pnpm build && pnpm start` w `frontend/` na tym samym komputerze (`BACKEND_URL` zostaje `http://localhost:8080`); skanery otwierają `http://<ip-komputera>:3000`.

**Znane ryzyko – bezpieczny kontekst:** service worker (praca offline aplikacji) działa w Chrome tylko przez HTTPS lub `localhost`. Adres `http://192.168.x.x` tego nie spełnia, więc offline PWA na skanerze może nie działać. Do sprawdzenia na prawdziwym urządzeniu; możliwe wyjścia: certyfikat HTTPS zainstalowany na skanerach albo ustawienie Chrome pozwalające traktować dany adres jako bezpieczny. Dopóki skaner jest w zasięgu sieci, zapis do backendu działa bez service workera.

**Bezpieczeństwo:** API nie ma uwierzytelniania i domyślnie przyjmuje żądania z dowolnego adresu (CORS `*`). Dopuszczalne w izolowanej sieci demo; przed realnym wdrożeniem dodać klucz API/logowanie i HTTPS.

**Opcjonalnie (poza hackathonem):** `DATABASE_URL` pozwala przełączyć backend na Postgres (np. zewnętrzny); adres w formie `postgres://...` jest tłumaczony na JDBC automatycznie.

## Dane demo i testy

**Scenariusze (`DemoSeeder`):** `basic` (5 wpisów, 1 krytyczny – wzorcowy brief), `quiet` (brak usterek), `busy` (18 wpisów z 8 h, część potwierdzona/rozwiązana, dane stałe po każdym ładowaniu), `critical` (6 krytycznych w różnych sektorach + 3 średnie).

**Skrypt `scripts/demo.sh`** (adres: `BASE_URL`, domyślnie `http://localhost:8080`):
```
scripts/demo.sh load busy       # załaduj scenariusz
scripts/demo.sh live 5          # co 5 s nowe zgłoszenie "ze skanera" (Ctrl+C kończy)
scripts/demo.sh offline         # test kolejki offline: te same wpisy 2x, bez duplikatów
scripts/demo.sh brief           # wygeneruj i wypisz brief
scripts/demo.sh reset
```

**Testy backendu (`pnpm test:api`):** `DemoScenariosTest` sprawdza każdy scenariusz, symulator i brief; `MockScanner` (w `src/test`) to mock skanera z kolejką offline – wysyła zgłoszenia częściowo, ponawia je i weryfikuje idempotentność po `id`.
