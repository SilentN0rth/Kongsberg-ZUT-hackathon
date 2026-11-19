# Kongsberg ZUT Hackathon — Podsumowanie Pomysłów i Strategii

Dokument podsumowuje wszystkie koncepcje zebrane na tablicy Figma (`tkCCph84GAIpIe3FaM7Zxu`), analizę ryzyk oraz rekomendowaną ścieżkę wdrożenia na 10-godzinny hackathon.

---

## 1. Faworyt i Rekomendacja Główna: **WatchBrief**

> **Pitch na scenę (1 zdanie):**  
> *„Nasz pomocnik przyda się osobie, która chce w 2 minuty bezbłędnie zdać wachtę i zgłosić usterkę do serwisu, zamiast po 12 godzinach ciężkiej pracy tracić czas na ręczne przepisywanie notatek i maili.”*

### 🎯 Dlaczego to wygrywa hackathon?
- **Styk z biznesem Kongsberg Maritime:** Kongsberg zarabia na serwisie 24/7, automatyce okrętowej i systemach monitorowania. Nieprecyzyjne zgłoszenia usterki generują ogromne koszty i opóźnienia.
- **Realny ból marynarza:** Przekazywanie wachty (handover) to najbardziej newralgiczny moment – zmęczenie po 12h powoduje utratę kluczowych informacji.
- **Bezpieczeństwo wdrożeniowe (10h):** Zamiast budować rozległy system ERP lub skomplikowanego chatbota, zespół implementuje jeden, dopracowany przepływ: **Notatka offline ➔ Ustrukturyzowana karta ➔ Zdanie wachty ➔ Paczka serwisowa Low-Bandwidth**.

### 🧩 4 Kluczowe Filary WatchBrief:
1. **Szybki wpis z obchodu:** Zdjęcie elementu + duże przyciski typu *tap-to-tag* (dostosowane do pracy w rękawicach w hałaśliwej siłowni) oraz notatka głosowa (dozwolona w wyciszonym ECR lub na mostku).
2. **Automatyczna strukturyzacja (AI Human-in-the-Loop):** System parsuje surowy opis na ustrukturyzowaną kartę: identyfikacja sprzętu ze statkowej bazy, wstępna ocena priorytetu oraz precyzyjne odwołanie do strony w instrukcji producenta.
3. **Handover Brief (Jednostronicowe zdanie wachty):** Zmiennik otrzymuje zwięzłą listę otwartych spraw, parametrów do obserwacji i zatwierdza przejęcie wachty jednym kliknięciem.
4. **Paczka serwisowa Low-Bandwidth:** Jednym kliknięciem generowany jest lekki, skompresowany pakiet (opis + zdjęcie + parametry telemetryczne) przygotowany pod wolne/drogie łącze satelitarne wprost do Centrum Serwisowego Kongsberg 24/7.

---

## 2. Odpowiedzi na Trudne Pytania Jury (Obrona Projektu)

| Pułapka / Zarzut Jury | Rzeczywistość na morzu | Rozwiązanie w prototypie |
| :--- | :--- | :--- |
| **Hałas w maszynowni (100–105 dB)** | Marynarze noszą nauszniki, mają zaolejone rękawice; dyktowanie głosem w siłowni nie działa. | Interfejs z dużymi kafelkami **Tap-to-tag** + szybkie foto. Głos dozwolony wyłącznie w wyciszonym ECR / na mostku. |
| **Brak Internetu (Klatka Faradaya)** | Stalowy kadłub tłumi sygnały Wi-Fi/GSM, a łącze satelitarne jest drogie i limitowane. | Architektura **100% offline-first** z lokalną bazą (np. SQLite/PWA) i kolejką synchronizacji (przycisk symulacji offline w demo). |
| **Przepisy i Odpowiedzialność (SOLAS/ISM)** | AI nie może podejmować autonomicznych decyzji ani zastępować oficjalnego logbooka. | Narzędzie ma status asystenta operacyjnego – człowiek zawsze weryfikuje i zatwierdza wpis (*Human-in-the-Loop*). |
| **Opór Załogi („Wielki Brat”)** | Marynarze bojkotują narzędzia armatora służące do ich inwigilacji. | Narracja: narzędzie zabija biurokrację i daje zmęczonemu oficerowi **30 minut snu** po wachcie. |
| **Oślepianie w nocy na mostku** | Jasny ekran smartfona niszczy adaptację wzroku oficera w ciemności. | Przełącznik **Bridge Night Mode** (kontrast czerwono-czarny). Drobiazg robiący ogromne wrażenie na sędziach morskich. |

---

## 3. Zestawienie Wszystkich Pomysłów z Tablicy Figma

### Grupa A: Praca operacyjna, serwis i automatyka (Najwyższy fit Kongsberg)
- **WatchBrief / WatchMate:** Cyfrowy asystent zdawania wachty i pakietowania zgłoszeń serwisowych.
- **Zdjęcie ➔ Zgłoszenie usterki:** Rozpoznawanie tabliczek znamionowych i części ze zdjęć; tłumaczenie wielojęzycznych opisów na profesjonalny raport po angielsku dla Kongsberg Service.
- **SeaFix / SnapManual (Offline Manual Copilot):** RAG po instrukcjach technicznych urządzeń; generowanie 3 konkretnych kroków diagnostycznych. *(Uwaga: ryzyko halucynacji i zarzutu o „zwykły wrapper GPT”)*.
- **Mentor przy konkretnym urządzeniu:** Skanowanie QR/kodu na pompie/rozdzielni wyświetlające historię i usterki tego konkretnego egzemplarza na danym statku.
- **CargoCheck Voice:** Prowadzony głosem obchód pokładu i ładowni (hands-free), generujący raport BHP / Port State Control.
- **AnchorWatch Alert:** Monitorowanie danych GPS i wiatru z głosowym ostrzeżeniem o ryzyku wleczenia kotwicy.

### Grupa B: Dobrostan, załoga i czas wolny (Średni / Niski fit z Kongsberg)
- **Wachtowy zegar snu (Rest & Fatigue Coach):** Planer okien snu i kofeiny pod systemy wachtowe (4/8, 6/6) z automatyczną walidacją limitów odpoczynku wg **MLC 2006 / STCW** (min. 10h/dobę, 77h/tydz.).
- **PortBuddy (Planer zejścia na ląd):** Mikro-plany na 3h postoju w porcie (dystans, misja Stella Maris z darmowym Wi-Fi, bezpieczny bufor powrotu).
- **Galley & FitSea:** Ćwiczenia w kabinie dopasowane do przechyłów statku + kalkulator snu i kawy.
- **GalleySync:** Aplikacja do zgłaszania alergii i głosowania na menu, z uwzględnieniem potraw lekkostrawnych przy sztormie.
- **CrewBridge:** Słownik i tłumacz morskiego slangu oraz komend (EN, PL, PH, UA) działający w 100% offline.
- **SeaMind:** Rytuał wyciszenia po wachcie (oddech, biały szum tłumiący wibracje silnika, prywatny offline dziennik).
- **SkillLog:** Organizer ważności certyfikatów morskich STCW i zliczania dni pływania (*sea time*).

---

## 4. Matryca Decyzyjna (Kluczowe Opcje)

| Koncepcja | Główna zaleta | Główne ryzyko na hackathonie | Dopasowanie do Kongsberga | Werdykt |
| :--- | :--- | :--- | :--- | :--- |
| **WatchBrief (Rekomendowany)** | Realny ból, łączy załogę z serwisem 24/7, efektowne i bezpieczne demo | Rozdrobnienie na zbyt wiele funkcji zamiast 1 perfekcyjnej ścieżki | **Bardzo wysokie** (serwis, automatyka, telemetria) | **WYBÓR #1** |
| **Offline Manual Copilot (RAG)** | Łatwy do wdrożenia prosty RAG na dokumentach PDF | Posądzenie o „kolejny wrapper na LLM”, ryzyko halucynacji w procedurach | **Średnie** (obawy o bezpieczeństwo procedur) | Opcja rezerwowa |
| **Rest & Fatigue Coach** | Bezpieczny temat, wysoka empatia, walidacja MLC 2006 | Trudno wywołać „efekt wow” w 5 min; temat dla HR armatora, nie dla Kongsberga | **Niskie / Średnie** | Nie rekomendowany |

---

## 5. Plan Działania na Hackathon (10h)
1. **Nazwa:** Zachować neutralną nazwę (np. *WatchBrief* lub *DeckHand*) i pokazać w prezentacji, jak wpina się w ekosystem Kongsberg Maritime.
2. **Ścieżka Demo (Golden Path):**
   - Krok 1: Wpis z obchodu (zdjęcie manometru/pompy + zaznaczenie anomalii jednym tapnięciem).
   - Krok 2: Ustrukturyzowanie zdarzenia w karcie usterki (Human-in-the-loop).
   - Krok 3: Wygenerowanie raportu zdania wachty dla zmiennika.
   - Krok 4: Wygenerowanie lekkiej paczki serwisowej przygotowanej do wysyłki do Kongsberg Service Center.
3. **Dodatki prezentacyjne:** Przełącznik Bridge Night Mode oraz widoczna symulacja kolejki offline.
