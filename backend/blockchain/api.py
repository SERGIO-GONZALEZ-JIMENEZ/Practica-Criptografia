from dotenv import load_dotenv
load_dotenv() # Carga variables de .env al principio
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import cast, List # Necesario para reconstruir SList

from .blockchain import Blockchain
from .block import Block # Necesario para reconstruir los bloques
from ..utils.slist.node import Node
from ..utils.crypto.encript import cifrar_aes, descifrar_aes # Necesitas descifrar

def cargar_clave_maestra() -> bytes:
    # Ajusta la ruta
    RUTA_CLAVE = os.getenv("MASTER_KEY_PATH", "master.key") 
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ruta_clave_abs = os.path.abspath(os.path.join(script_dir, '..', '..', RUTA_CLAVE))
    
    print(f"Buscando clave maestra en: {ruta_clave_abs}")

    if not os.path.exists(ruta_clave_abs):
        print(f"FATAL: No se encuentra el archivo de clave '{ruta_clave_abs}'")
        print("Asegúrate de ejecutar 'generate_key.py' primero")
        exit()

    with open(ruta_clave_abs, "rb") as f:
        clave = f.read()
        if len(clave) != 16:
            print(f"FATAL: La clave maestra en '{ruta_clave_abs}' no tiene el tamaño correcto (16 bytes)")
            exit()
        return clave

CLAVE_MAESTRA = cargar_clave_maestra()
print("Clave maestra cargada correctamente")

def load_chain_from_file() -> Blockchain:
    # Carga la blockchain en casa de que hubiera alguna
    blockchain_instance = Blockchain() # Empieza con una vacía (con génesis)
    FILE_PATH = "blockchain_segura.json" # Asume que está en la raíz
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path_abs = os.path.abspath(os.path.join(script_dir, '..', '..', FILE_PATH))
    
    # Comprueba si existe
    if not os.path.exists(file_path_abs):
        print(f"INFO: No se encontró '{file_path_abs}'. Iniciando con una blockchain nueva.")
        return blockchain_instance

    try:
        print(f"INFO: Cargando blockchain desde '{file_path_abs}'...")
        #Lee el archivo JSON encriptado
        with open(file_path_abs, "r") as f:
            encrypted_data = json.load(f)

        # Descifra el contenido usando la clave maestra
        # Imprimimos mensajes de debug para el descifrado aes
        print(f"DEBUG: Descifrando datos con AES (EAX mode), longitud de clave: {len(CLAVE_MAESTRA)*8} bits")
        decrypted_json_string = descifrar_aes(
            encrypted_data["ciphertext_b64"],
            encrypted_data["nonce_b64"],
            encrypted_data["tag_b64"],
            CLAVE_MAESTRA
        )
        # Si funciona le imprimimos mensaje debug de todo correcto
        print("DEBUG: Datos descifrados y verificados correctamente")

        # Convierte el string JSON descifrado en una lista de diccionarios
        chain_data_list = json.loads(decrypted_json_string)

        if not chain_data_list: # Si el archivo estaba vacío o corrupto
             print("INFO: Archivo de blockchain vacío. Iniciando con génesis.")
             return Blockchain()
        print(f"Reconstruyendo {len(chain_data_list)} bloques...")
        # Crea una instancia de Blockchain SIN el génesis (si es posible) o simplemente la crearemos y luego sobreescribiremos su cadena.
        blockchain_instance = Blockchain()
        blockchain_instance.chain.head = None # Borra la cadena interna
        blockchain_instance.chain.size = 0

        # Para reconstruir la SList eficientemente
        current_node = None

        for block_data in chain_data_list:
            # Recrea el objeto Block CON el hash guardado (ver Paso 2 abajo)
            block_obj = Block(
                index=block_data['index'],
                votes=block_data['votes'],
                previous_hash=block_data['previous_hash'],
                # Pasa el hash guardado y el timestamp guardado
                saved_hash=block_data['hash'],
                saved_timestamp=block_data['timestamp']
            )

            # Añade el bloque a la SList manualmente
            new_node = Node(block_obj)
            if blockchain_instance.chain.head is None:
                blockchain_instance.chain.head = new_node
                current_node = new_node
            else:
                # Asegurarse de que current_node no sea None
                if current_node:
                    current_node.next = new_node
                    current_node = new_node
                else: # Caso head vacía
                    print("ERROR: Inconsistencia al reconstruir SList")
                    blockchain_instance.chain.head.next = new_node
                    current_node = new_node


            blockchain_instance.chain.size += 1

        print(f"INFO: Blockchain cargada. Longitud: {blockchain_instance.chain.size}")

        # Validar la cadena cargada
        if not blockchain_instance.is_chain_valid():
             print("ERROR FATAL: La blockchain cargada está corrupta!")
             exit()

        return blockchain_instance

    except Exception as e:
        print(f"ERROR FATAL al cargar/descifrar la blockchain: {str(e)}")
        print("Iniciando con una blockchain nueva como medida de seguridad.")
        return Blockchain() # Devuelve una instancia nueva si falla la carga

app = FastAPI()

# Configuración CORS
origin = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

blockchain = load_chain_from_file() 

print("Servidor Blockchain listo para recibir peticiones.")

# Añadimos mempool para manejar los votos y el número de votos por bloque
mempool : List[dict] = []
VOTES_PER_BLOCK = 5 # Este valor se puede modificar

# Creamos función para insertar votos a la mempool y luego este al block
def add_insert_block():
    global mempool

    if not mempool:
        print("Error: Intento de crear bloque con mempool vacía")
        return False
    
    # Mensajes para ver como los añade
    print(f"Creando bloque con {len(mempool)} votos")
    try:
        # Pasa copia de la mempool actual
        blockchain.add_block(list(mempool))
        block = blockchain.read_last_block()
        print(f"Nuevo bloque añadido: Índice {block.index}, Hash {block.hash}")

        # Limpia la mempool y resetea el contador
        mempool.clear()
        print("Mempool limpiada.")
        return True

    except Exception as e:
        print(f"ERROR CRÍTICO al crear bloque desde mempool: {str(e)}")
        return False
    
# Endpoints 
@app.post("/add_vote")
async def add_vote_endpoint(vote: dict):
    global mempool # Necesitamos modificar la variable global

    try:
        # Añadir el voto a la mempool
        mempool.append(vote)
        print(f"Voto añadido a la mempool. Tamaño actual: {len(mempool)/VOTES_PER_BLOCK}")

        block_created = False # Para manejar el caso en el que queden votos en la mempool

        # Compruebar si hemos alcanzado el límite
        if len(mempool) >= VOTES_PER_BLOCK:
            add_insert_block() # Llama a la función para crear el bloque

        response = {
            "message": "Voto recibido y añadido a la mempool",
            "mempool_size": len(mempool),
            "block_created_bool": block_created,
            "votes_needed_for_block": VOTES_PER_BLOCK
        }

        # Si se crea bloque se añade el index
        if block_created:
            response["new_block_index"] = blockchain.read_last_block().index
            
    except Exception as e:
        print(f"Error en /add_vote: {str(e)}")
        return {"error": "Error interno al procesar el voto"}, 500

@app.get("/save_chain_encrypted")
async def save_chain():
    try:
        chain_json = blockchain.to_json()
        print(f"DEBUG: Cifrando datos con AES (EAX mode), longitud de clave: {len(CLAVE_MAESTRA)*8} bits")
        encrypted_data = cifrar_aes(chain_json, CLAVE_MAESTRA)
        print("DEBUG: Datos cifrados correctamente")

        # Guarda en la raíz del proyecto
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path_abs = os.path.abspath(os.path.join(script_dir, '..', '..', "blockchain_segura.json"))
        
        with open(file_path_abs, "w") as f:
            json.dump(encrypted_data, f, indent=4) # Añade indentación para legibilidad
        
        print(f"Blockchain guardada en: {file_path_abs}")
        return {"message": f"Blockchain encriptada y guardada en {file_path_abs}"}
        
    except Exception as e:
        
        print(f"Error en /save_chain_encrypted: {str(e)}")
        return {"error": str(e)}, 500

# Creamos función para el caso en el que no se alcanze el umbral de votos 
@app.post("/force_block_creation")
async def force_block_creation():
    if not mempool:
        return {"message": "Mempool vacía no se creó ningún bloque"}
    add_insert_block()
    return {"message": f"Bloque creado a la fuerza con {blockchain.read_last_block().index} bloques en total"}
