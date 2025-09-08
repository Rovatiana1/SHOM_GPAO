from WEB_SERVICE.db import db

class FactureModel(db.Model):
    __tablename__ = 'facture'

    id = db.Column(db.BigInteger, primary_key=True)  # Utilisation de BigInteger pour 'bigserial'
    id_lot_traite = db.Column(db.BigInteger, nullable=True)
    num_facture = db.Column(db.String(40), nullable=True)
    num_ps = db.Column(db.String(16), nullable=True)
    nni = db.Column(db.String(40), nullable=True)
    date_modification = db.Column(db.DateTime, nullable=True)
    id_user = db.Column(db.Integer, nullable=True)
    id_nature_facture = db.Column(db.Integer, nullable=True)
    id_page_lot = db.Column(db.Integer, nullable=True)
    id_correcteur = db.Column(db.Integer, nullable=True)    
    anomalie = db.Column(db.Boolean, nullable=True)
    id_facture_anomalie = db.Column(db.Integer, nullable=True)
