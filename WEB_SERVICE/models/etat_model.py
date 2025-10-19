from WEB_SERVICE.db import db

class Etat(db.Model):
    __tablename__ = "p_etat"

    id_etat = db.Column(db.Integer, primary_key=True)
    libelle = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "idEtat": self.id_etat,
            "libelle": self.libelle,
        }

    def __repr__(self):
        return f"<PEtat {self.id_etat} - {self.libelle}>"
