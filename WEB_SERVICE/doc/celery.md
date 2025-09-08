Merci pour tous les détails : tu as une architecture très bien pensée et propre ! Maintenant, on va **remplacer `AsyncJobSystem` par Celery + Redis** dans ton application, tout en conservant ton fonctionnement actuel (WebSocket, suivi en DB, gestion d’erreurs, etc.).

---

## 🎯 Objectif : intégrer `Celery` et `Redis` dans ton workflow existant.

---

### ✅ Étapes concrètes :

---

### 1. **Installer les dépendances**

```bash
pip install celery redis
```

---

### 2. **Créer `celery_app.py`**

> 📁 `WEB_SERVICE/celery_app.py`

```python
from celery import Celery

def make_celery(app=None):
    celery = Celery(
        'web_service',
        broker='redis://localhost:6379/0',
        backend='redis://localhost:6379/0'
    )

    if app:
        celery.conf.update(app.config)
        TaskBase = celery.Task

        class ContextTask(TaskBase):
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return TaskBase.__call__(self, *args, **kwargs)
        celery.Task = ContextTask

    return celery
```

---

### 3. **Modifier ton `app.py` (ou `__init__.py`) principal**

Ajoute :

```python
from WEB_SERVICE.celery_app import make_celery

app = Flask(__name__)
celery = make_celery(app)
```

---

### 4. **Créer la tâche de conversion PDF avec Celery**

> 📁 `WEB_SERVICE/tasks/conversion_tasks.py`

```python
from WEB_SERVICE.celery_app import make_celery
from WEB_SERVICE.app import app
from WEB_SERVICE.db import db
from datetime import datetime
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel
from WEB_SERVICE.services.PDF_converter_service import PDFConverterService
from WEB_SERVICE.events.websocket_events import notify_job_status
from WEB_SERVICE.utils.logger import log_action, save_log_db

celery = make_celery(app)

@celery.task(bind=True)
def celery_pdf_conversion(self, job_id, flux_id, fields, file_path, target_folder):
    try:
        job = db.session.query(ConversionJobModel).filter_by(job_id=job_id).first()
        if not job:
            raise Exception(f"Job {job_id} not found")

        job.status = 'processing'
        job.progress = 0
        job.start_time = datetime.utcnow()
        db.session.commit()

        notify_job_status(job_id, 'processing', progress=0)

        def progress_callback(percent, page_done=None, total_pages=None):
            job.progress = percent
            job.page_done = page_done
            job.message = f"Page {page_done}/{total_pages} traitée"
            job.updated_at = datetime.utcnow()
            db.session.commit()
            notify_job_status(job_id, 'processing', progress=percent)

        # Appel conversion
        PDFConverterService.convert_pdf_to_jpg(
            job_id=job_id,
            filename=fields["filename"].rsplit('.', 1)[0],
            num_facture=fields["num_facture"],
            num_ps=fields["num_ps"],
            nni=fields["nni"],
            date_reception=fields["date_reception"],
            id_flux=flux_id,
            pdf_path=file_path,
            output_folder=target_folder,
            progress_callback=type("Progress", (), {"update": progress_callback})(),
            job=job
        )

        job.status = 'done'
        job.progress = 100
        job.end_time = datetime.utcnow()
        db.session.commit()
        notify_job_status(job_id, 'done', progress=100)

        log_action(f"✅ PDF conversion done: {fields['filename']}")
        return {"status": "done", "progress": 100}

    except Exception as e:
        db.session.rollback()
        if job:
            job.status = 'error'
            job.error_message = str(e)
            job.end_time = datetime.utcnow()
            db.session.commit()
            notify_job_status(job_id, 'error', error=str(e))
        save_log_db(
            filename=fields["filename"],
            action_type="ERROR",
            message="PDF conversion failed",
            level="ERROR",
            checksum_md5=fields.get("md5"),
            trace=str(e)
        )
        raise
```

---

### 5. **Remplacer `AsyncJobSystem().add_job(...)` par l'appel Celery**

#### Dans ta ressource `FileUpload`

Remplace :

```python
job_system = AsyncJobSystem()
job_id = job_system.add_job(...)
```

par :

```python
from WEB_SERVICE.tasks.conversion_tasks import celery_pdf_conversion

celery_pdf_conversion.delay(
    job_id,
    flux_id,
    fields,
    file_path,
    target_folder
)
```

---

### 6. **Démarrer Redis et Celery worker**

* Lancer Redis :

```bash
redis-server
```

* Lancer Celery :

```bash
celery -A WEB_SERVICE.tasks.conversion_tasks.celery worker --loglevel=info
```

---

### 7. ✅ WebSocket et suivi DB continueront à fonctionner

Ton système de WebSocket `notify_job_status(...)` est bien intégré dans la tâche Celery — pas besoin de modifier cette partie.

---

### 🔍 Tu veux aussi suivre l’état des tâches (bonus) ?

Tu peux créer un endpoint pour interroger Celery :

```python
from celery.result import AsyncResult

@app.route('/task-status/<task_id>')
def get_task_status(task_id):
    res = AsyncResult(task_id)
    return {
        "state": res.state,
        "info": res.info
    }
```

---

Souhaites-tu que je te fasse le **fichier complet déjà modifié `FileUpload` avec l'appel à Celery intégré** ?
