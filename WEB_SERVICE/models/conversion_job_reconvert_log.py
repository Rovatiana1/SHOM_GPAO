from datetime import datetime
from sqlalchemy.orm import relationship, foreign
from WEB_SERVICE.db import db
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel  # si besoin

class ConversionJobReconvertLog(db.Model):
    __tablename__ = 'conversion_job_reconvert_log'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(128), nullable=False, index=True)  # pas de ForeignKey ici

    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_ip = db.Column(db.String, nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    message = db.Column(db.Text, nullable=True)

    # Relation SQLAlchemy pour liaison objet sans contrainte FK en base
    job = relationship(
        "ConversionJobModel",
        primaryjoin=foreign(job_id) == ConversionJobModel.job_id,
        lazy="joined",
        viewonly=True,
    )
