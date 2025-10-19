from WEB_SERVICE.db import db

class LotClient(db.Model):
    __tablename__ = "p_lot_client"

    id_lotclient = db.Column(db.BigInteger, primary_key=True, autoincrement=True)  # 🔹 Ajout autoincrement
    id_dossier = db.Column(db.Integer, nullable=True)
    libelle = db.Column(db.String(100), nullable=True)
    id_pers = db.Column(db.Integer, nullable=True)
    id_etat = db.Column(db.Integer, nullable=True)
    id_categorie = db.Column(db.Integer, nullable=True)
    cible_a = db.Column(db.Float, nullable=True)
    cible_b = db.Column(db.Float, nullable=True)
    cible_c = db.Column(db.Float, nullable=True)
    cible_d = db.Column(db.Float, nullable=True)
    vitesse_equilibre = db.Column(db.Float, nullable=True)
    commentaires = db.Column(db.JSON, nullable=True)
    id_cae = db.Column(db.Integer, nullable=True)
    id_cae_2 = db.Column(db.Integer, nullable=True)
    id_cae_projet = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            "idLotClient": self.id_lotclient,
            "idDossier": self.id_dossier,
            "libelle": self.libelle,
            "idPers": self.id_pers,
            "idEtat": self.id_etat,
            "idCategorie": self.id_categorie,
            "cibleA": self.cible_a,
            "cibleB": self.cible_b,
            "cibleC": self.cible_c,
            "cibleD": self.cible_d,
            "vitesseEquilibre": self.vitesse_equilibre,
            "commentaires": self.commentaires,
            "idCae": self.id_cae,
            "idCae2": self.id_cae_2,
            "idCaeProjet": self.id_cae_projet,
        }
