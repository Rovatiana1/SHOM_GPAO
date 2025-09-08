from WEB_SERVICE.models.storage_log import StorageLogModel
from WEB_SERVICE.db import db
from datetime import datetime
import json 
from WEB_SERVICE.utils.constant import LOG_FILE


def save_log_db(
    filename,
    action_type,
    message,
    level,
    source_ip=None,
    user_agent=None,
    trace=None,
    checksum_md5=None
):
    # Convertir les dictionnaires en JSON
    if isinstance(message, dict):
        message = json.dumps(message, ensure_ascii=False)
    
    log = StorageLogModel(
        filename=filename,
        action_type=action_type,
        message=message,  # Maintenant une chaîne
        level=level,
        source_ip=source_ip,
        user_agent=user_agent,
        trace=trace,
        checksum_md5=checksum_md5
    )
    try:
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        log_action(f"⚠️ Erreur DB: {str(e)}")
        
# 📅 Log structuré avec horodatage lisible
def log_action(message):
    timestamp = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    full_message = f"[{timestamp}] {message}\n"
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(full_message)