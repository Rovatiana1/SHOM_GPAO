from WEB_SERVICE.extensions import socketio
from flask_socketio import emit
from WEB_SERVICE.db import db
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel
from datetime import datetime

def notify_job_status(job_id, status, progress=None, job_data=None, error=None):
    """Notifie le front-end d'un changement de statut"""
    job = db.session.query(ConversionJobModel).filter_by(job_id=job_id).first()
    if not job:
        print(f"⚠️ Job {job_id} introuvable.")
        return
        
    data = {
        'job_id': job_id,
        'status': status,
        'timestamp': datetime.utcnow().isoformat(),
        'flux_id': job.flux_id
    }

    if progress is not None:
        data['progress'] = progress

    if error:
        data['error'] = error

    # Fusionner les données supplémentaires si fournies
    if job_data:
        for key, value in job_data.items():
            # Ne pas écraser les clés déjà présentes (comme 'status', 'progress')
            if key not in data:
                if isinstance(value, datetime):
                    data[key] = value.isoformat()
                else:
                    data[key] = value

    socketio.emit('job_status_update', data, room=f"job_{job_id}")

def notify_job_created(job_id):
    """Notifie le front-end de la création d'un nouveau Job avec format personnalisé"""
    job = db.session.query(ConversionJobModel).filter_by(job_id=job_id).first()
    if not job:
        print(f"⚠️ Job {job_id} introuvable.")
        return

    payload = {
        "id": job.job_id,
        "name_job": f"Job {job.job_id}",
        "name_flux": job.flux.libelle if job.flux else "Unknown Flux",
        "type": "conversion",
        "status": job.status,
        "progress": job.progress or 0,
        "error": job.error_message or None,
        "pageDone": job.page_done,
        "totalPages": job.total_pages,
        "message": job.message,
        "startTime": job.start_time.isoformat() if job.start_time else datetime.utcnow().isoformat(),
        "endTime": job.end_time.isoformat() if job.end_time else datetime.utcnow().isoformat(),
        "createdAt": job.created_at.isoformat() if job.created_at else datetime.utcnow().isoformat(),
        "updatedAt": job.updated_at.isoformat() if job.updated_at else datetime.utcnow().isoformat()
    }

    socketio.emit("job_created", payload)