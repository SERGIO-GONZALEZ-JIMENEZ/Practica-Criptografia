import json
from fastapi import FastAPI # Transforma json a diccionarios de python
from fastapi.middleware.cors import CORSMiddleware 
from .blockchain import Blockchain
from ..utils.crypto.encript import cifrar_aes
import os

def cargar_clave_maestra() -> bytes:
    RUTA_CLAVE = "master.key" 
    if not os.path.exists(RUTA_CLAVE):
        print(f"FATAL: No se encuentra el archivo de clave '{RUTA_CLAVE}'")
        print("Asegúrate de ejecutar 'generate_key.py' primero.")
        exit() # Detiene el servidor si no hay clave

    with open(RUTA_CLAVE, "rb") as f: # rb es Read Bytes
        clave = f.read()
        if len(clave) != 16: 
            print("FATAL: La clave maestra no tiene el tamaño correcto (16 bytes).")
            exit()
        return clave

# Carga la clave al iniciar el script
CLAVE_MAESTRA = cargar_clave_maestra()
print("Clave maestra cargada correctamente.")

# Creamos aplicación fastAPI
app = FastAPI()

# Damos permiso a nuestro servidor
origin = ["http://localhost:3000"]

# Añadimos el middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Única instancia de la blockchain
blockchain = Blockchain()
print("Servidor Blockchain iniciado.\n")

# Endpoint para añadir votos
@app.post("/add_vote")
async def add_vote_endpoint(vote: dict):
    blockchain.add_block([vote])
    block = blockchain.read_last_block()
    return {
        "message": "Voto añadido",
        "block_index": block.index,
        "block_hash": block.hash
    }

# Endpoint para obtener cadena
@app.get("/save_chain_encrypted")
async def save_chain():
    try:
        chain_json = blockchain.to_json()
        encrypted_data = cifrar_aes(chain_json, CLAVE_MAESTRA)
        with open("blockchain_segura.json", "w") as f:
            json.dump(encrypted_data, f)
        return {"message": "Blockchain encriptada y guardada en blockchain_segura.json"}
    except Exception as e:
        return {"error": str(e)}, 500