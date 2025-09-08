from datetime import datetime
from sqlalchemy.orm import relationship, foreign
from sqlalchemy import and_
from WEB_SERVICE.db import db
from WEB_SERVICE.models.flux import FluxModel

class ConversionJobModel(db.Model):
    __tablename__ = 'conversion_jobs'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(128), unique=True, nullable=False)
    flux_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(32), nullable=False, default='queued')  # queued, processing, done, error
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    archived_at = db.Column(db.DateTime, nullable=True)
    
    # ✅ Nouvelles colonnes à ajouter :
    progress = db.Column(db.Integer, default=0)
    page_done = db.Column(db.Integer)
    total_pages = db.Column(db.Integer)
    message = db.Column(db.Text)

    # ✅ Ajout de foreign() pour indiquer la colonne étrangère
    flux = relationship(
        "FluxModel",
        primaryjoin=foreign(flux_id) == FluxModel.id_flux,
        lazy="joined",
        viewonly=True
    )
    
    
    def as_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "flux_id": self.flux_id,
            "libelle_flux": self.flux.libelle if self.flux else None,  # 👈 ici
            "status": self.status,
            "start_time": str(self.start_time) if self.start_time else None,
            "end_time": str(self.end_time) if self.end_time else None,
            "error_message": self.error_message,
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None,
            "archived_at": str(self.archived_at) if self.archived_at else None,
            "progress": self.progress,
            "page_done": self.page_done,
            "total_pages": self.total_pages,
            "message":self.message,
        }
