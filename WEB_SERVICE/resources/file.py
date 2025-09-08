from flask_restful import Resource
from flask import request, current_app
import hashlib
from WEB_SERVICE.utils.logger import save_log_db, log_action
from WEB_SERVICE.utils.md5 import md5_exists, md5_exists_in_db, save_md5
from WEB_SERVICE.services.File_upload_service import FileUploadService
from WEB_SERVICE.services.PDF_converter_service import PDFConverterService
from WEB_SERVICE.utils.async_job_system import AsyncJobSystem
from WEB_SERVICE.utils.constant import UPLOAD_FOLDER_JPG, UPLOAD_FOLDER_PDF, FACTURE_PAR_DEFAUT, PS_PAR_DEFAUT
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel
from WEB_SERVICE.models.storage_file import StorageFileModel
from WEB_SERVICE.models.conversion_job_reconvert_log import ConversionJobReconvertLog
from datetime import datetime
from WEB_SERVICE.db import db
from WEB_SERVICE.events.websocket_events import notify_job_status, notify_job_created
from PyPDF2 import PdfReader
import json
import os


class FileUpload(Resource):
    def post(self):
        """Endpoint pour le téléversement de fichiers"""
        try:
            # Vérification présence fichier
            if not request.files.get('file'):
                FileUploadService.log_error("File not provided")
                return {"error": "File not provided"}, 400
                
            file = request.files['file']
            form = request.form
            headers = request.headers
            
            # Validation champs requis
            missing_fields, fields = FileUploadService.validate_required_fields(form, headers)
            if missing_fields:
                FileUploadService.log_error(
                    f"Missing required fields: {missing_fields}",
                    file.filename,
                    fields.get('md5')
                )
                return {"error": "Missing required fields", "fields": missing_fields}, 400
                
            # Validation fichier
            file_error = FileUploadService.validate_file(file)
            if file_error:
                FileUploadService.log_error(file_error, file.filename, fields['md5'])
                return {"error": file_error}, 400
                
            # Lecture fichier
            file_bytes = file.read()
            
            # Validation MD5
            isValidate, md5_validate = FileUploadService.validate_md5(file_bytes, fields['md5'])
            if isValidate is not True:
                FileUploadService.log_error(f"Invalid MD5 provided for {fields['filename']} - corrupted file | md5 : {md5_validate}", file.filename, fields['md5'])
                return {"error": f"Invalid MD5 provided for {fields['filename']} - corrupted file", "md5": md5_validate}, 400
            md5_local = md5_validate
            
            # ✅ Vérification doublon : si existe déjà → HTTP 200 avec body identique
            existing_file = md5_exists_in_db(md5_local)
            if existing_file:
                # Log succès             
                log_action(f"📂 File already exists: {fields['filename']} | MD5: {md5_local}")
                save_log_db(
                    filename=file.filename,
                    action_type="DUPLICATE",
                    message="File already exists",
                    level="WARNING",
                    checksum_md5=md5_local,
                    source_ip=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                # On retourne la réponse en utilisant la méthode du modèle
                return existing_file.as_response_json(), 200 # ✅ Pas de 409, mais 200 pour ne pas bloquer Nument
            
            target_folder_pdf = UPLOAD_FOLDER_PDF + f"/{fields['project_id']}" # ajout dossier projet pour specifier les pdfs , important pour usage future (comme les fichier ne sont plus ecrasés mais stockés par projet)
            # Créer le dossier de sortie si nécessaire
            os.makedirs(target_folder_pdf, exist_ok=True)
            
            # Sauvegarde fichier
            file_path, file_size = FileUploadService.save_file(
                file_bytes, 
                file.filename,
                target_folder_pdf
            )
            
            # Valeurs par défaut en cas d'absence de num_facture ou num_ps (par sécurité)
            fields['num_facture'] = form.get('num_facture') or FACTURE_PAR_DEFAUT
            fields['num_ps'] = form.get('num_ps') or PS_PAR_DEFAUT
            
            fields['nni'] = form.get('nni') # Pas de valeur par défaut pour nni, on laisse vide si non fournie
            
            # Préparation métadonnées
            meta_info = {
                "filename_sent": fields['filename'],
                "num_facture": fields['num_facture'],
                "num_ps": fields['num_ps'],
                "nni": fields['nni'],
                "date_reception": fields['date_reception'],
                "project_id": fields['project_id']
            }
            
            # Sauvegarde base de données
            flux_id = FileUploadService.save_to_database(
                file=file,
                file_path=file_path,
                file_size=file_size,
                md5=md5_local,
                meta_info=meta_info,
                request=request,
                project_id=fields['project_id']
            )
            
            # Conversion du PDF en images
            target_folder = UPLOAD_FOLDER_JPG + f"/{fields['project_id']}" + f"/{fields['date_reception']}"

            reader = PdfReader(file_path)
            total_pages = len(reader.pages)
            
            # Création de l'entrée en base d'abord
            job_id = str(datetime.utcnow().timestamp())  # ou autre ID unique si AsyncJobSystem n'en fournit pas

            job_entry = ConversionJobModel(
                job_id=job_id,
                flux_id=flux_id,
                status='queued',
                created_at=datetime.utcnow(),
                total_pages=total_pages
            )
            db.session.add(job_entry)
            db.session.commit()
            
            # Notifier le front-end de la création du job
            notify_job_created(job_id)

  
            # Notifier le front-end que le job est en file d'attente
            notify_job_status(job_id, 'queued')
            
            def async_task(progress_callback):
                PDFConverterService._async_pdf_conversion(job_id, flux_id, fields, file_path, target_folder, progress_callback)

            # Ajout du job en arrière-plan
            job_system = AsyncJobSystem()
            job_id = job_system.add_job(
                async_task,
                current_app._get_current_object(),
                job_id
            )
            
            print("✅ Job envoyé en arrière-plan, on retourne au client")

            # Log succès
            log_action(f"📥 File received: {fields['filename']} | MD5: {md5_local}")
            save_log_db(
                filename=file.filename,
                action_type="UPLOAD",
                message="File successfully received, validated and stored",
                level="INFO",
                checksum_md5=md5_local,
                source_ip=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            save_md5(md5_local)
            
            return {
                "message": "File successfully received, validated and stored",
                "filename": fields['filename'],
                "md5": md5_local,
                "size_bytes": file_size,
                **meta_info,
                "file_path": file_path,
                "conversion_job_id": job_id,
                "conversion_status": "queued"
            }, 200
            
        except Exception as e:
            FileUploadService.log_error(
                f"Error processing the file: {str(e)}",
                file.filename if 'file' in locals() else None,
                None,
                e
            )
            return {"error": "Error processing the file", "details": str(e)}, 500

class FileReconvert(Resource):
    def post(self, job_id):
        try:
            # 1. Récupérer job existant
            job = ConversionJobModel.query.filter_by(job_id=job_id).first()
            if not job:
                return {"error": f"No job found with id {job_id}"}, 404

            # 2. Récupérer fichier via flux
            flux = job.flux
            flux_id = flux.id_flux
            file_record = StorageFileModel.query.filter_by(id=flux.id_storage_file).first()
            if not file_record or not file_record.file_path:
                return {"error": f"No file found for job_id {job_id}"}, 404
            file_path = file_record.file_path

            # 3. Charger meta_info JSON
            meta_info = {}
            if file_record.meta_info:
                try:
                    meta_info = json.loads(file_record.meta_info)
                except Exception as e:
                    return {"error": "Invalid meta_info format", "details": str(e)}, 500

            # ✅ Vérifier que les champs obligatoires sont bien présents
            missing_meta_fields = []
            if not meta_info.get("date_reception"):
                missing_meta_fields.append("date_reception")
            if not meta_info.get("project_id"):
                missing_meta_fields.append("project_id")

            if missing_meta_fields:
                return {
                    "error": "Missing required metadata fields",
                    "missing_fields": missing_meta_fields
                }, 400
                
            fields = {
                "filename": file_record.filename,
                "num_facture": meta_info["num_facture"],
                "num_ps": meta_info["num_ps"],
                "nni": meta_info["nni"],
                "date_reception": meta_info["date_reception"],  # Assurés non vides
                "project_id": meta_info["project_id"]
            }

            reader = PdfReader(file_path)
            total_pages = len(reader.pages)

            # 4. Réinitialiser les infos du job
            job.status = "queued"
            job.progress = 0
            job.page_done = 0
            job.start_time = datetime.utcnow()
            job.end_time = None
            job.error_message = None
            job.message = None
            job.total_pages = total_pages
            job.updated_at = datetime.utcnow()
            db.session.commit()

            notify_job_status(job_id, "queued")

            target_folder = f"{UPLOAD_FOLDER_JPG}/{fields['project_id']}/{fields['date_reception']}"

            def async_task(progress_callback):
                PDFConverterService._async_pdf_conversion(
                    job_id, flux_id, fields, file_path, target_folder, progress_callback
                )

            job_system = AsyncJobSystem()
            job_system.add_job(
                async_task,
                current_app._get_current_object(),
                job_id
            )

            # 5. Log reconversion dans la table dédiée
            reconvert_log = ConversionJobReconvertLog(
                job_id=job_id,
                user_ip=request.remote_addr,
                user_agent=request.headers.get('User-Agent'),
                message="Reconversion démarrée"
            )
            db.session.add(reconvert_log)
            db.session.commit()

            log_action(f"🔁 Reconversion relancée pour {file_record.filename} | Job: {job_id}")
            save_log_db(
                filename=file_record.filename,
                action_type="RECONVERT",
                message="Reconversion relancée",
                level="INFO",
                checksum_md5=file_record.checksum_md5,
                source_ip=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )

            return {
                "message": "Reconversion relancée",
                "conversion_job_id": job_id,
                "conversion_status": "queued"
            }, 200

        except Exception as e:
            return {
                "error": "Error during reconversion",
                "details": str(e)
            }, 500


class FileHash(Resource):
    def get(self):
        """Récupérer la signature MD5."""
        try:
            # Vérifie si le fichier est présent
            if 'file' not in request.files:
                log_action(f"❌ Error : No files provided")
                return {"error": "No files provided"}, 400

            file = request.files['file']

            if file.filename == '':
                log_action(f"❌ Error : Empty file name")
                return {"error": "Empty file name"}, 400

            # Vérifie que c’est bien un PDF
            if 'pdf' not in file.content_type.lower():
                log_action(f"❌ Error : The file must be a PDF")
                return {"error": "The file must be a PDF"}, 400

            # Lecture du contenu pour hash
            file_content = file.read()
            md5_hash = hashlib.md5(file_content).hexdigest()

            # Optionnel : taille
            file_size = len(file_content)

            log_action(f"📥 MD5 Generate : {file.filename} | MD5: {md5_hash} | size: {round(file_size/1024, 2)} KB")
            return {
                "filename": file.filename,
                "md5": md5_hash,
                "size_bytes": file_size
            }, 200
        except Exception as e:
            log_action(f"❌ Error : Error retrieving MD5s")
            return {"message": "Error retrieving MD5s", "error": str(e)}, 500

