from WEB_SERVICE.db import db

class Dossier(db.Model):
    __tablename__ = "p_dossier"

    id_dossier = db.Column(db.Integer, primary_key=True)
    num_dossier = db.Column(db.String(30), nullable=True)
    atelier = db.Column(db.String(64), nullable=True)
    corresp = db.Column(db.String(128), nullable=True)
    demarrage = db.Column(db.String(24), nullable=True)
    delai = db.Column(db.String(128), nullable=True)
    date_livr = db.Column(db.String(64), nullable=True)
    vitesse_estime = db.Column(db.String(24), nullable=True)
    vitesse_reelle = db.Column(db.String(24), nullable=True)
    volume_prevue = db.Column(db.String(24), nullable=True)
    resource_op = db.Column(db.String(8), nullable=True)
    resource_cp = db.Column(db.String(8), nullable=True)
    id_pers_cp = db.Column(db.Integer, nullable=True)
    id_equipe = db.Column(db.Integer, nullable=True)
    id_cl = db.Column(db.Integer, nullable=True)
    id_etat = db.Column(db.Integer, nullable=True)
    id_atelier = db.Column(db.Integer, nullable=True)
    credit_heure = db.Column(db.BigInteger, nullable=True)
    heure_consome = db.Column(db.BigInteger, nullable=True)
    alias = db.Column(db.String(64), nullable=True)
    volume_recu = db.Column(db.String(24), nullable=True)
    id_cae = db.Column(db.Integer, nullable=True)
    id_cae_2 = db.Column(db.Integer, nullable=True)
    id_cae_projet = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            "idDossier": self.id_dossier,
            "numDossier": self.num_dossier,
            "atelier": self.atelier,
            "corresp": self.corresp,
            "demarrage": self.demarrage,
            "delai": self.delai,
            "dateLivr": self.date_livr,
            "vitesseEstime": self.vitesse_estime,
            "vitesseReelle": self.vitesse_reelle,
            "volumePrevue": self.volume_prevue,
            "resourceOp": self.resource_op,
            "resourceCp": self.resource_cp,
            "idPersCp": self.id_pers_cp,
            "idEquipe": self.id_equipe,
            "idCl": self.id_cl,
            "idEtat": self.id_etat,
            "idAtelier": self.id_atelier,
            "creditHeure": self.credit_heure,
            "heureConsome": self.heure_consome,
            "alias": self.alias,
            "volumeRecu": self.volume_recu,
            "idCae": self.id_cae,
            "idCae2": self.id_cae_2,
            "idCaeProjet": self.id_cae_projet,
        }
