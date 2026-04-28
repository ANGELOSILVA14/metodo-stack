@echo off
set PATH=C:\Users\angel\node-portable\node-v22.15.0-win-x64;%PATH%
cd /d "%~dp0"
echo.
echo   Metodo Stack - iniciando...
echo   Acesse: http://localhost:3000
echo   Pressione Ctrl+C para parar.
echo.
npm run dev
