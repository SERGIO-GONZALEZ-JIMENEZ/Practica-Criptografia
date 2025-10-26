# Práctica Criptografía - Sistema de Votación Electrónica con Blockchain

Este proyecto implementa un sistema de votación electrónica seguro utilizando conceptos criptográficos como hashing de contraseñas, JWT para sesiones, firmas digitales (RS256 para JWT), cifrado simétrico (AES para la blockchain) y una blockchain simple para registrar los votos de forma inmutable.

## 🏛️ Arquitectura

El sistema se compone de tres partes principales:

1.  **Frontend (app-web/):** Interfaz de usuario creada con HTML, CSS y JavaScript (jQuery). Permite a los usuarios registrarse, iniciar sesión y emitir su voto.
2.  **Servidor Principal (backend/server/ - Node.js):**
    * Gestiona el registro (`/register`) y la autenticación (`/login`) de usuarios usando **bcrypt** para hashear contraseñas y **JWT** (firmado con RS256) para gestionar sesiones.
    * Sirve los archivos estáticos del frontend.
    * Valida los votos (ej. comprueba que un usuario no vote dos veces) consultando la base de datos **Supabase**.
    * Actúa como intermediario, enviando los votos validados a la API de Python.
3.  **API de Blockchain (backend/blockchain/ - Python):**
    * Utiliza **FastAPI** para exponer endpoints REST.
    * Mantiene la cadena de bloques (`Blockchain`) en memoria.
    * Recibe los votos del servidor Node.js y los añade a la blockchain (`/add_vote`).
    * Permite guardar la blockchain de forma cifrada en un archivo (`/save_chain_encrypted`) usando **AES** con una clave maestra.

**Flujo de Voto:** Navegador → Servidor Node.js (Validación + JWT) → API Python (Añadir a Blockchain)

## ⚙️ Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

* **Node.js:** Versión 18 o superior. ([Descargar Node.js](https://nodejs.org/))
* **Python:** Versión 3.10 o superior. ([Descargar Python](https://www.python.org/downloads/))
* **pip3:** El gestor de paquetes de Python (normalmente viene con Python).
* **Git:** Para clonar el repositorio (opcional si descargas el ZIP).

## 🚀 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

1.  **Clonar el Repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd Practica-Criptografia
    ```

2.  **Instalar Dependencias de Node.js:**
    ```bash
    npm install
    ```

3.  **Configurar Entorno Virtual de Python:**
    ```bash
    # Crear el entorno virtual (si no existe)
    python3 -m venv .venv
    # Activar el entorno virtual
    # macOS/Linux:
    source .venv/bin/activate
    # Windows (cmd):
    # .venv\Scripts\activate.bat
    # Windows (PowerShell):
    # .\.venv\Scripts\Activate.ps1
    ```

4.  **Instalar Dependencias de Python:**
    ```bash
    pip3 install -r requirements.txt
    ```

5.  **Configurar Archivos `.env`:**
    * Copia `backend/server/.env.example` a `backend/server/.env`.
    * Edita `backend/server/.env` y añade tu clave **`service_role`** de Supabase.
    * Copia `backend/blockchain/.env.example` a `backend/blockchain/.env` (si lo creaste).

6.  **Generar Claves Criptográficas:**
    * **Clave Maestra AES:** Ejecuta `python3 generate_key.py` en la raíz. Esto creará el archivo `master.key` (asegúrate de que esté en tu `.gitignore`).
    * **Claves RSA (para JWT):** Si no has incluido `private.key` y `public.key` en la carpeta `backend/server/`, necesitas generarlas. Puedes usar `openssl`:
        ```bash
        # Generar clave privada RSA de 2048 bits
        openssl genrsa -out backend/server/private.key 2048
        # Extraer la clave pública correspondiente
        openssl rsa -in backend/server/private.key -pubout -out backend/server/public.key
        ```

## ▶️ Ejecución (Usando los Scripts)

Hemos proporcionado scripts para facilitar el arranque de ambos servidores.

1.  **Abre tu terminal** en la carpeta raíz del proyecto (`Practica-Criptografia`).

2.  **Ejecuta el script correspondiente a tu sistema operativo:**

    * **macOS / Linux:**
        ```bash
        # Asegúrate de que el script tenga permisos de ejecución
        chmod +x start.sh
        # Ejecuta el script
        ./start.sh
        ```

    * **Windows:**
        ```bash
        # Ejecuta el script de batch
        .\start.bat
        ```

3.  **¿Qué hacen los scripts?**
    * Activan el entorno virtual de Python.
    * Inician el servidor de la API de Blockchain (Python/FastAPI) en `http://localhost:8000`.
    * Inician el servidor principal (Node.js/Express) en `http://localhost:3000`.
    * Intentan abrir tu navegador web automáticamente en `http://localhost:3000`.

4.  **Para detener los servidores:**
    * **macOS/Linux:** Presiona `Ctrl+C` en la terminal donde ejecutaste `start.sh`. El script se encargará de detener ambos procesos.
    * **Windows:** Presiona `Ctrl+C` en la ventana del servidor Node.js. Luego, **cierra manualmente** la ventana separada donde se está ejecutando el servidor Python.

## 📖 Uso de la Aplicación

1.  Una vez ejecutados los scripts se te abrirá tu navegador con `http://localhost:3000`.
2.  **Registro:** Usa el formulario para crear una nueva cuenta. Se guardará en tu base de datos Supabase con la contraseña hasheada.
3.  **Inicio de Sesión:** Inicia sesión con la cuenta creada. El servidor verificará la contraseña y te devolverá un token JWT que se guardará en el navegador.
4.  **Votación:** Serás redirigido a la página de votación (`vote.html`).
    * La lista de candidatos se carga desde el servidor Node.js (que la obtiene de Supabase).
    * Selecciona un candidato y haz clic en "Confirmar voto".
    * El navegador enviará el voto y el token JWT al servidor Node.js.
    * El servidor Node.js validará el token, comprobará que no hayas votado antes y enviará el voto a la API de Python.
    * La API de Python añadirá el voto a la blockchain en memoria.
    * Recibirás una confirmación.
5.  **(Opcional) Guardar Blockchain:** Para guardar el estado actual de la blockchain en el archivo cifrado `blockchain_segura.json`, abre una nueva pestaña y visita `http://localhost:8000/save_chain_encrypted`.

---
