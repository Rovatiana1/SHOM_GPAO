import os
from pdf2image import convert_from_path
from WEB_SERVICE.db import db
from WEB_SERVICE.models.lot import LotModel
from WEB_SERVICE.models.facture import FactureModel
from datetime import datetime
from PyPDF2 import PdfReader
from WEB_SERVICE.events.websocket_events import notify_job_status

class PDFConverterService:
    @staticmethod
    def convert_pdf_to_jpg(job_id, filename, num_facture, num_ps, nni, date_reception, id_flux, pdf_path, output_folder, progress_callback, job):
        try:
            # Créer le dossier de sortie si nécessaire
            os.makedirs(output_folder, exist_ok=True)
            
            # Convertir le PDF en images
            image_paths = []

            reader = PdfReader(pdf_path)
            total = len(reader.pages)
            # Sauvegarder chaque page
            for i in range(total):
                # Convertir une page à la fois
                images = convert_from_path(pdf_path, dpi=100, first_page=i+1, last_page=i+1)
                image = images[0]

                image_path = output_folder + f"/{filename}_0{i+1}.jpg"
                image.save(image_path, 'JPEG')
                image_paths.append(image_path)

                # Sauvegarde BDD
                PDFConverterService._save_page_metadata(
                    filename,
                    image_path,
                    date_reception,
                    id_flux,
                    num_facture,
                    num_ps,
                    nni
                )

                # Mise à jour progression
                percent = int((i + 1) / total * 100)
                # Actualiser la ligne du job dans la base à chaque page
                job.progress = percent
                job.page_done = i + 1
                job.message = f"Page {i + 1}/{total} traitée"
                job.updated_at = datetime.utcnow()
                db.session.commit()
                
                job_data = progress_callback.update(
                                percent=percent,
                                page_done=i + 1,
                                total_pages=total
                            )
                # print(f"job_data: {job_data}")
                notify_job_status(job_id, 'processing', progress=percent, job_data=job_data)


            print(f"Image sauvegardée : {pdf_path}")
            return image_paths
        except Exception as e:
            print(f"Erreur lors de la conversion : {e}")
            raise  # Propager l'exception pour une gestion centralisée

    @staticmethod
    def _save_page_metadata(filename, image_path, date_reception, id_flux, num_facture, num_ps, nni):
        """Crée les enregistrements Lot et Facture pour une page"""
        lot = PDFConverterService._create_lot(
            filename, 
            image_path, 
            date_reception, 
            id_flux
        )
        
        PDFConverterService._create_facture(
            id_flux, 
            num_facture, 
            num_ps, 
            nni, 
            lot.id
        )

    @staticmethod
    def _create_lot(filename, image_path, date_reception, id_flux):
        """Crée un enregistrement LotModel"""
        # Convertir le Path en string si nécessaire
        if hasattr(image_path, 'as_posix'):
            chemin_image_str = image_path.as_posix()  # Convertit en string avec des slashs
        else:
            chemin_image_str = str(image_path)
            
        lot = LotModel(
            libelle=filename,
            chemin_image=chemin_image_str,
            date_reception=date_reception,
            date_modification=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            date_injection=date_reception,
            id_flux=id_flux
        )
        db.session.add(lot)
        db.session.flush()  # Génère l'ID sans committer
        return lot

    @staticmethod
    def _create_facture(id_flux, num_facture, num_ps, nni, id_page_lot):
        """Crée un enregistrement FactureModel"""
        facture = FactureModel(
            id_lot_traite=id_flux,
            num_facture=num_facture,
            num_ps=num_ps,
            nni=nni,
            date_modification=datetime.now(),
            id_user=1,
            id_nature_facture=1,
            id_page_lot=id_page_lot,
            id_correcteur=1,
            anomalie=False,
            id_facture_anomalie=None
        )
        db.session.add(facture)
        return facture
    
    
    # Ensuite lancement du traitement asynchrone
    @staticmethod
    def _async_pdf_conversion(job_id, flux_id, fields, file_path, target_folder, progress_callback):
        try:
            from WEB_SERVICE.services.File_upload_service import FileUploadService
            from WEB_SERVICE.services.PDF_converter_service import PDFConverterService
            from WEB_SERVICE.models.conversion_jobs import ConversionJobModel
            from datetime import datetime
            from WEB_SERVICE.db import db
            from WEB_SERVICE.events.websocket_events import notify_job_status
            from WEB_SERVICE.utils.logger import save_log_db, log_action

            # Récupérer le nom de fichier sans extension
            raw_filename = fields['filename']
            clean_filename = os.path.splitext(raw_filename)[0]  # enlève .pdf ou autre
            
            job = db.session.query(ConversionJobModel).filter_by(job_id=job_id).first()
            if job:
                job.status = 'processing'
                job.progress = 0
                job.start_time = datetime.utcnow()
                db.session.commit()

            # Notifier le front-end que le job est en cours
            notify_job_status(job_id, 'processing', progress=0)
            

            PDFConverterService.convert_pdf_to_jpg(
                job_id=job_id,
                filename=clean_filename,
                num_facture=fields['num_facture'],
                num_ps=fields['num_ps'],
                nni=fields['nni'],
                date_reception=fields['date_reception'],
                id_flux=flux_id,
                pdf_path=file_path,
                output_folder=target_folder,
                progress_callback=progress_callback,  # Modifiez votre service pour accepter un callback
                job=job  # <-- ici
            )

            if job:
                job.status = 'done'
                job.progress = 100
                job.end_time = datetime.utcnow()
                db.session.commit()

            # Notifier le front-end que le job est terminé
            notify_job_status(job_id, 'done', progress=100)
            
            log_action(f"✅ PDF conversion done: {fields['filename']}")
        except Exception as e:
            db.session.rollback()
            if job:
                job.status = 'error'
                job.error_message = str(e)
                job.end_time = datetime.utcnow()
                db.session.commit()
                                
            # Notifier le front-end de l'erreur
            notify_job_status(job_id, 'error', error=str(e))
            
            FileUploadService.log_error(
                f"PDF conversion failed: {str(e)}",
                clean_filename,
                fields['md5'],
                e
            )