@echo off
REM --- Script de Arranque para Windows ---

echo ===================================
echo = Iniciando servidores...           =
echo ===================================

REM Activar entorno virtual Python
echo.
echo == Activando entorno virtual Python (.venv)... ==
call .venv\Scripts\activate.bat

IF %ERRORLEVEL% NEQ 0 (
    echo X Error: No se pudo activar el entorno virtual .venv\Scripts\activate.bat. Asegurate de que existe.
    pause
    exit /b 1
)

REM Iniciar servidor Python (API Blockchain) en una NUEVA ventana
echo.
echo == Iniciando servidor Python (FastAPI/Uvicorn) en el puerto 8000... ==
echo (Se abrira una nueva ventana para el servidor Python)
start "Python API Server" cmd /k "uvicorn backend.blockchain.api:app --port 8000"
echo == Servidor Python iniciado en una nueva ventana. ==
timeout /t 3 /nobreak > nul

REM Iniciar servidor Node.js en ESTA ventana
echo.
echo == Iniciando servidor Node.js en el puerto 3000... ==
echo (Presiona Ctrl+C para detener este servidor)

REM Intenta abrir navegador
start http://localhost:3000

node backend/server/server.mjs

REM Mensaje final
echo.
echo == Servidor Node.js detenido. ==
echo == No olvides cerrar la ventana del servidor Python manualmente. ==
pause