#!/bin/bash

# --- Script de Arranque para macOS/Linux ---

echo "Iniciando servidores..."

# Activar entorno virtual Python
echo "Activando entorno virtual Python (.venv)..."
source .venv/bin/activate

# Comprobar si la activación funcionó
if [ $? -ne 0 ]; then
  echo "Error: No se pudo activar el entorno virtual .venv. Asegúrate de que existe."
  exit 1
fi

# Iniciar servidor Python (API Blockchain) en segundo plano
echo "Iniciando servidor Python (FastAPI/Uvicorn) en el puerto 8000..."
uvicorn backend.blockchain.api:app --port 8000 &
PYTHON_PID=$! # Guarda el ID del proceso de Python
echo "Servidor Python iniciado con PID $PYTHON_PID"
sleep 2 # Da un par de segundos para que arranque

# Función para detener el servidor Python al salir
cleanup() {
  echo ""
  echo "Deteniendo servidor Python (PID $PYTHON_PID)..."
  kill $PYTHON_PID
  echo "Servidores detenidos."
  exit 0
}

# Captura la señal de interrupción (Ctrl+C) para limpiar
trap cleanup SIGINT

# 3. Iniciar servidor Node.js en primer plano
echo "Iniciando servidor Node.js en el puerto 3000..."
# Intenta abrir navegador
(sleep 3 && (open http://localhost:3000 || xdg-open http://localhost:3000)) &
node backend/server/server.mjs

# Si el script de Node termina por sí solo (no por Ctrl+C), detenemos Python
cleanup