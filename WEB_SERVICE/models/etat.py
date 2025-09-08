from WEB_SERVICE.db import db

class EtatModel(db.Model):
    __tablename__ = 'etat'

    id = db.Column(db.Integer, primary_key=True)
    libelle = db.Column(db.String(80), nullable=False)
    
    def __init__(self, libelle):
        self.libelle = libelle

    def json(self):
        return {
            'id': self.id,
            'libelle': self.libelle
        }
