from backend.utils.crypto.encript import generar_aes_key_master
import os

NOMBRE_ARCHIVO_CLAVE = "master.key"

if os.path.exists(NOMBRE_ARCHIVO_CLAVE):
    print(f"ERROR: El archivo '{NOMBRE_ARCHIVO_CLAVE}' ya existe.")
    print("Bórralo si quieres generar una clave nueva (¡no lo hagas si ya está en uso!).")
else:
    # 1. Genera los 16 bytes aleatorios
    clave = generar_aes_key_master()
    
    # 2. Guarda la clave en un archivo binario
    with open(NOMBRE_ARCHIVO_CLAVE, "wb") as f: # 'wb' = Write Bytes
        f.write(clave)
        
    print(f"Clave maestra generada y guardada en '{NOMBRE_ARCHIVO_CLAVE}'.")
    print("✅ ¡ÉXITO!")
    print("---------------------------------------------------------------")
    print(f"❗️❗️ IMPORTANTE: Añade '{NOMBRE_ARCHIVO_CLAVE}' a tu .gitignore AHORA")
    print("---------------------------------------------------------------")