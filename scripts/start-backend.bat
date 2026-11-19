@echo off
REM Buduje (jesli trzeba) i uruchamia backend. Wymaga Java 21; Maven tylko przy pierwszym budowaniu.
cd /d "%~dp0..\backend"
if not exist target\watchbrief-backend-0.1.0.jar (
  call mvn -q -B -DskipTests package || exit /b 1
)
java -jar target\watchbrief-backend-0.1.0.jar
