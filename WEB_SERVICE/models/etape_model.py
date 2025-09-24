from WEB_SERVICE.db import db

class Etape(db.Model):
    __tablename__ = "p_etape"

    id_etape = db.Column(db.Integer, primary_key=True, autoincrement=True)
    libelle = db.Column(db.String(100), nullable=True)
    parent_etape = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "idEtape": self.id_etape,
            "libelle": self.libelle,
            "parentEtape": self.parent_etape,
        }
