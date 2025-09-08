from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import os
import base64
from WEB_SERVICE.config import AES_SECRET_KEY

SECRET_KEY = AES_SECRET_KEY

def generate_hash_password(password):
    return generate_password_hash(password)

def verify_hash_password(password, hash):
    return check_password_hash(hash, password)

def encrypt_data(plain_text):
    # Générer un vecteur d'initialisation (IV)
    iv = os.urandom(16)
    
    # Créer le chiffrement AES en mode CBC
    cipher = Cipher(algorithms.AES(SECRET_KEY), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    # Ajouter du padding aux données
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(plain_text.encode()) + padder.finalize()

    # Crypter les données
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    
    # Retourner le message crypté en base64 URL Safe et l'IV
    encrypted_result = base64.urlsafe_b64encode(iv + encrypted_data).decode()
    return encrypted_result

# Fonction de décryptage
def decrypt_data(encrypted_text):
    # Ajouter le padding si nécessaire pour que la longueur soit un multiple de 4
    padded_encrypted_text = encrypted_text + "=="[(len(encrypted_text) % 4):]
    
    # Décoder la donnée cryptée en base64 URL Safe
    encrypted_data = base64.urlsafe_b64decode(padded_encrypted_text)
    
    # Extraire l'IV et les données cryptées
    iv = encrypted_data[:16]
    actual_encrypted_data = encrypted_data[16:]
    
    # Créer le chiffrement AES en mode CBC
    cipher = Cipher(algorithms.AES(SECRET_KEY), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()

    # Décrypter les données
    decrypted_padded_data = decryptor.update(actual_encrypted_data) + decryptor.finalize()

    # Enlever le padding
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    decrypted_data = unpadder.update(decrypted_padded_data) + unpadder.finalize()

    return decrypted_data.decode()
