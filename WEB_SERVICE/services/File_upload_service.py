from flask import request
from WEB_SERVICE.db import db
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from WEB_SERVICE.models.storage_file import StorageFileModel
from WEB_SERVICE.models.flux import FluxModel
from WEB_SERVICE.utils.logger import save_log_db, log_action
from WEB_SERVICE.utils.md5 import get_md5
from WEB_SERVICE.utils.constant import UPLOAD_FOLDER_PDF


class FileUploadService:
    @staticmethod
    def validate_required_fields(form_data, headers):
        required_fields = {
            "filename": form_data.get('filename'),
            "md5": form_data.get('md5') or headers.get('X-File-MD5'),
            "date_reception": form_data.get('date_reception'),
            "project_id": form_data.get('project_id')
        }
        missing = [field for field, value in required_fields.items() if not value]
        return missing, required_fields

    @staticmethod
    def validate_file(file):
        if not file or file.filename == '':
            return "Empty file name attached with file"
        if 'pdf' not in file.content_type.lower():
            return f"Non-PDF type received | type ({file.content_type}), PDF required"
        return None

    @staticmethod
    def validate_md5(file_bytes, provided_md5):
        if not provided_md5:
            return False, "MD5 not provided"
        
        local_md5 = get_md5(file_bytes)  # Assurez-vous que get_md5 retourne une chaîne en minuscules
        if provided_md5.lower() != local_md5:
            return False, f"MD5 mismatch: {provided_md5} vs {local_md5}"
        return True, local_md5

    @staticmethod
    def save_file(file_bytes, filename, upload_folder=UPLOAD_FOLDER_PDF):
        filename = secure_filename(filename)
        file_path = upload_folder +  f"/{filename}"
        with open(file_path, 'wb') as f:
            f.write(file_bytes)
        return file_path, len(file_bytes)

    @staticmethod
    def save_to_database(file, file_path, file_size, md5, meta_info, request, project_id):
        # Création du StorageFileModel
        storage_file = StorageFileModel(
            filename=file.filename,
            content_type=file.content_type,
            meta_info=json.dumps(meta_info),
            byte_size=file_size,
            checksum_md5=md5,
            source_ip=request.remote_addr,
            file_path=file_path,
            user_agent=request.headers.get('User-Agent'),
            created_at=datetime.utcnow()
        )
        db.session.add(storage_file)
        db.session.flush()

        # Création du FluxModel
        flux = FluxModel(
            libelle=meta_info["filename_sent"],
            id_etat=4,
            date_reception=meta_info["date_reception"],
            id_user=1,
            id_correcteur=None,
            id_storage_file=storage_file.id,
            id_specialite_source=project_id
        )
        db.session.add(flux)
        db.session.commit()
        
        return flux.id_flux

    @staticmethod
    def log_error(message, filename=None, md5=None, exception=None):
        log_action(f"❌ Error: {message}")
        save_log_db(
            filename=filename,
            action_type="ERROR",
            message=message,
            level="ERROR",
            checksum_md5=md5,
            trace=str(exception) if exception else None,
            source_ip=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
