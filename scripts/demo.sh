#!/usr/bin/env bash
# Narzedzia demo/test dla backendu (curl). Adres: BASE_URL, domyslnie http://localhost:8080
#
#   scripts/demo.sh reset                 powrot do scenariusza basic
#   scripts/demo.sh scenarios             lista scenariuszy
#   scripts/demo.sh load busy             zaladuj scenariusz (basic|quiet|busy|critical)
#   scripts/demo.sh simulate [n]          dodaj n losowych zgloszen "ze skanerow" (domyslnie 1)
#   scripts/demo.sh live [sekundy] [n]    co N sekund dodawaj zgloszenia (Ctrl+C konczy) - do pokazu skrzynki serwisu
#   scripts/demo.sh offline               test kolejki offline: te same 3 zgloszenia wysylane 2 razy, nie moze byc duplikatow
#   scripts/demo.sh brief                 wygeneruj brief i wypisz tekst
set -e
BASE="${BASE_URL:-http://localhost:8080}"
cmd="${1:-help}"

case "$cmd" in
  reset)     curl -fsS -X POST "$BASE/api/demo/reset"; echo ;;
  scenarios) curl -fsS "$BASE/api/demo/scenarios"; echo ;;
  load)      curl -fsS -X POST "$BASE/api/demo/scenarios/${2:?podaj nazwe scenariusza}"; echo ;;
  simulate)  curl -fsS -X POST "$BASE/api/demo/simulate?count=${2:-1}" | sed 's/},{/},\n{/g'; echo ;;
  live)
    every="${2:-5}"; n="${3:-1}"
    echo "Symulacja skanerow: $n zgloszen co ${every}s na $BASE (Ctrl+C konczy)"
    while true; do
      curl -fsS -X POST "$BASE/api/demo/simulate?count=$n" >/dev/null && echo "$(date +%H:%M:%S) +$n zgloszenie"
      sleep "$every"
    done ;;
  offline)
    for pass in 1 2; do
      for i in 1 2 3; do
        dev=$(echo "pompa-01 ster-01 winda-01" | cut -d' ' -f$i)
        curl -fsS -o /dev/null -X POST "$BASE/api/reports" -H 'Content-Type: application/json' \
          -d "{\"id\":\"offline-$i\",\"deviceId\":\"$dev\",\"symptom\":\"Test offline\",\"priority\":\"MEDIUM\",\"note\":\"przebieg $pass\"}"
      done
      echo "Przebieg $pass wyslany"
    done
    echo "Wpisow offline-* w bazie (oczekiwane 3):"
    curl -fsS "$BASE/api/reports" | grep -o '"id":"offline-[0-9]"' | sort -u | wc -l ;;
  brief)     curl -fsS -X POST "$BASE/api/handover/brief" | sed 's/\\n/\n/g'; echo ;;
  *) sed -n '2,11p' "$0" ;;
esac
