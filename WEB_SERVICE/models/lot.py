from WEB_SERVICE.db import db

class LotModel(db.Model):
    __tablename__ = 'lot'

    id = db.Column(db.Integer, primary_key=True)
    date_reception = db.Column(db.String(20), nullable=True)
    libelle = db.Column(db.String(500), nullable=True)
    chemin_image = db.Column(db.String(500), nullable=True)
    date_modification = db.Column(db.String(500), nullable=True)
    date_injection = db.Column(db.String(20), nullable=True)
    id_flux = db.Column(db.Integer, nullable=True)
