from WEB_SERVICE.db import db
import json
from sqlalchemy.orm import relationship, foreign
from WEB_SERVICE.models.flux import FluxModel
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel

class StorageFileModel(db.Model):
    __tablename__ = 'storage_file'

    id = db.Column(db.BigInteger, primary_key=True)
    filename = db.Column(db.String, nullable=False)
    content_type = db.Column(db.String, nullable=False)
    meta_info = db.Column(db.Text, nullable=True)  # ✅ anciennement 'metadata'
    byte_size = db.Column(db.BigInteger, nullable=False)
    # checksum_md5 = db.Column(db.String, nullable=False, unique=True)
    checksum_md5 = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    archived_at = db.Column(db.DateTime, nullable=True)
    source_ip = db.Column(db.String, nullable=True)  # ou db.INET si supporté
    file_path = db.Column(db.String, nullable=True)  # facultatif mais utile
    user_agent = db.Column(db.Text, nullable=True)
    
     # ✅ Relation inverse : un fichier peut avoir plusieurs flux (rare, mais possible)
    flux = relationship(
        "FluxModel",
        primaryjoin=foreign(id) == FluxModel.id_storage_file,
        lazy="joined",
        viewonly=True
    )
    def as_response_json(self, message="File already exists"):
        """
        Retourne un dict JSON structuré avec ConversionJob info si existant.
        """
        
        # Charger meta_info
        meta_data = json.loads(self.meta_info) if self.meta_info else {}

        print("StorageFileModel.as_response_json - self.flux:", self.flux.id_flux)
        # ✅ Récupérer le flux lié (si existe)
        flux = self.flux if self.flux else None

        # ✅ Récupérer le job lié (si existe)
        job = None
        if flux:
            job = ConversionJobModel.query.filter_by(flux_id=flux.id_flux).first()

        return {
            "message": message,
            "filename": self.filename,
            "md5": self.checksum_md5,
            "size_bytes": self.byte_size,
            **meta_data,
            "file_path": self.file_path,
            "conversion_job_id": job.job_id if job else None,
            "conversion_status": job.status if job else None
        }