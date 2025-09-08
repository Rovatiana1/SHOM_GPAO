from WEB_SERVICE.db import db
from sqlalchemy.orm import relationship, foreign

class FluxModel(db.Model):
    __tablename__ = 'flux'

    id_flux = db.Column(db.Integer, primary_key=True)
    libelle = db.Column(db.String(500), nullable=True)
    id_etat = db.Column(db.Integer, nullable=False)
    date_reception = db.Column(db.String(500), nullable=True)
    id_user = db.Column(db.Integer)
    id_correcteur = db.Column(db.Integer)
    id_storage_file = db.Column(db.Integer)
    id_specialite_source = db.Column(db.String)