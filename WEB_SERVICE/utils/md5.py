from WEB_SERVICE.models.storage_file import StorageFileModel
from WEB_SERVICE.utils.constant import MD5_LIST_FILE
import hashlib

    
# 🔐 MD5 depuis contenu
def get_md5(file_bytes):
    return hashlib.md5(file_bytes).hexdigest()

# 🔎 Vérifie doublon avec le fichier md5_list.txt
def md5_exists(md5_hash):
    with open(MD5_LIST_FILE, 'r') as f:
        return md5_hash in f.read().splitlines()
    
# 🔎 Vérifie doublon avec la base
def md5_exists_in_db(md5_hash):
    return StorageFileModel.query.filter_by(checksum_md5=md5_hash).first()


# 📝 Sauvegarde le hash reçu
def save_md5(md5_hash):
    with open(MD5_LIST_FILE, 'a') as f:
        f.write(md5_hash + '\n')
        