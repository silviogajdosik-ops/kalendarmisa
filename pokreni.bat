@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Kalendar misa - pokretanje lokalnog servera
echo ============================================
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    echo Pronaden Python - pokrecem server na http://localhost:8000
    start "Kalendar misa - server (ne zatvarajte ovaj prozor)" cmd /k python -m http.server 8000
    timeout /t 2 /nobreak >nul
    start "" http://localhost:8000
    goto kraj
)

where py >nul 2>nul
if %errorlevel%==0 (
    echo Pronaden Python (py launcher) - pokrecem server na http://localhost:8000
    start "Kalendar misa - server (ne zatvarajte ovaj prozor)" cmd /k py -m http.server 8000
    timeout /t 2 /nobreak >nul
    start "" http://localhost:8000
    goto kraj
)

where npx >nul 2>nul
if %errorlevel%==0 (
    echo Pronaden Node.js - pokrecem server na http://localhost:8000
    start "Kalendar misa - server (ne zatvarajte ovaj prozor)" cmd /k npx --yes serve -l 8000 .
    timeout /t 3 /nobreak >nul
    start "" http://localhost:8000
    goto kraj
)

echo GRESKA: Nije pronaden ni Python ni Node.js na ovom racunalu.
echo.
echo Instalirajte jedno od sljedeceg pa ponovno pokrenite ovu datoteku:
echo   - Python:  https://www.python.org/downloads/  (kod instalacije oznacite "Add python.exe to PATH")
echo   - Node.js: https://nodejs.org/
echo.
pause
exit /b 1

:kraj
echo.
echo Aplikacija bi se sada trebala otvoriti u pregledniku na http://localhost:8000
echo Da zaustavite server, zatvorite prozor "Kalendar misa - server".
echo.
pause
endlocal
