@echo off
cd /d "%~dp0"
docker compose up -d
echo.
echo Lexa berjalan di http://localhost:13000
pause
