import threading
from queue import Queue
from datetime import datetime
from WEB_SERVICE.utils.logger import log_action
from WEB_SERVICE.db import db
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel
from WEB_SERVICE.events.websocket_events import notify_job_status


class JobProgress:
    def __init__(self, job_id, job_system):
        self.job_id = job_id
        self.job_system = job_system

    def update(self, percent, page_done=None, total_pages=None):
        job_data = self.job_system.active_jobs[self.job_id]
        job_data["progress"] = percent

        if page_done is not None and total_pages is not None:
            job_data["page_done"] = page_done
            job_data["total_pages"] = total_pages
            job_data["message"] = f"Page {page_done}/{total_pages} traitée"

        return job_data


class AsyncJobSystem:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AsyncJobSystem, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.job_queue = Queue()
        self.max_workers = 1  # ← Ajuste selon ton CPU
        self.workers = []
        self.active_jobs = {}

        for _ in range(self.max_workers):
            worker = threading.Thread(target=self._worker_loop)
            worker.daemon = True
            worker.start()
            self.workers.append(worker)
            
    def _worker_loop(self):
        while True:
            job_id, job_func, app_context = self.job_queue.get()

            self.active_jobs[job_id]["status"] = "processing"
            self.active_jobs[job_id]["start_time"] = datetime.now()

            with app_context:
                try:
                    # Simule une exception
                    # raise Exception("Erreur volontaire pour test du bloc `except`")
                    
                    job_func()  # Le job reçoit un objet `progress`

                    self.active_jobs[job_id]["status"] = "done"
                    self.active_jobs[job_id]["end_time"] = datetime.now()

                    log_action(f"✅ Job {job_id} done successfully")

                except Exception as e:
                    self.active_jobs[job_id] = {
                        "status": "failed",
                        "error": str(e),
                        "end_time": datetime.now()
                    }

                    log_action(f"❌ Job {job_id} failed: {str(e)}")

                    # ✅ Mise à jour en base de données dans le même contexte
                    job = db.session.query(ConversionJobModel).filter_by(job_id=job_id).first()
                    if job:
                        job.status = 'error'
                        job.error_message = str(e)
                        job.end_time = datetime.utcnow()
                        db.session.commit()

                    # ✅ Notification front-end via WebSocket
                    notify_job_status(job_id, 'error', error=str(e))

                    print(f"[WORKER] ❌ Job {job_id} failed - {self.active_jobs[job_id]}")

            self.job_queue.task_done()

    def add_job(self, job_func, app, job_id):
        app_context = app.app_context()
        
        if self.job_queue.qsize() > 50:  # ← seuil de surcharge
            raise Exception("System is overloaded. Please try again later.")

        self.active_jobs[job_id] = {
            "status": "queued",
            "start_time": datetime.now(),
            "progress": 0,
        }

        def wrapped_job():
            progress = JobProgress(job_id, self)
            job_func(progress)  # 👉 Le job reçoit un objet de suivi

        self.job_queue.put((job_id, wrapped_job, app_context))
        return job_id

    def get_job_status(self, job_id):
        return self.active_jobs.get(job_id, {"error": "Job ID not found"})
