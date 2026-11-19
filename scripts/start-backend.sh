#!/usr/bin/env bash
# Buduje (jesli trzeba) i uruchamia backend. Wymaga Java 21; Maven tylko przy pierwszym budowaniu.
set -e
cd "$(dirname "$0")/../backend"
JAR=$(ls target/watchbrief-backend-*.jar 2>/dev/null | head -1 || true)
if [ -z "$JAR" ]; then
  mvn -q -B -DskipTests package
  JAR=$(ls target/watchbrief-backend-*.jar | head -1)
fi
exec java -jar "$JAR"
