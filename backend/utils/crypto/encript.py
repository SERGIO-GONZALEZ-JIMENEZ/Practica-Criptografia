from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
import base64

# Symmetric AES Encryption/Decryption
def cifrar_aes(texto: str):
    clave = get_random_bytes(16)
    cipher = AES.new(clave, AES.MODE_EAX)
    ct, tag = cipher.encrypt_and_digest(texto.encode())
    return {
        "ciphertext": base64.b64encode(ct).decode(),
        "nonce": base64.b64encode(cipher.nonce).decode(),
        "tag": base64.b64encode(tag).decode(),
        "clave": clave
    }

def descifrar_aes(ciphertext_b64, nonce_b64, tag_b64, clave):
    ct = base64.b64decode(ciphertext_b64)
    nonce = base64.b64decode(nonce_b64)
    tag = base64.b64decode(tag_b64)
    cipher = AES.new(clave, AES.MODE_EAX, nonce=nonce)
    return cipher.decrypt_and_verify(ct, tag).decode()

# Asymmetric RSA Signing/Verification
def generar_rsa_keys():
    key = RSA.generate(2048)
    return key, key.publickey()

def firmar(priv_key, data: bytes):
    h = SHA256.new(data)
    return base64.b64encode(pkcs1_15.new(priv_key).sign(h)).decode()

def verificar_firma(pub_key, data: bytes, firma_b64: str):
    h = SHA256.new(data)
    try:
        pkcs1_15.new(pub_key).verify(h, base64.b64decode(firma_b64))
        return True
    except (ValueError, TypeError):
        return False