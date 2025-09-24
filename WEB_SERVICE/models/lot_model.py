from WEB_SERVICE.db import db
from sqlalchemy.orm import relationship, foreign
from WEB_SERVICE.models.lot_client_model import LotClient
from WEB_SERVICE.models.dossier_model import Dossier
from WEB_SERVICE.models.ldt_model import Ldt

class Lot(db.Model):
    __tablename__ = "p_lot"

    id_lot = db.Column(db.BigInteger, primary_key=True)

    # 🔗 Foreign Keys
    id_lotclient = db.Column(db.BigInteger, db.ForeignKey("p_lot_client.id_lotclient"), nullable=True)
    id_dossier = db.Column(db.Integer, db.ForeignKey("p_dossier.id_dossier"), nullable=True)

    # Champs simples
    id_etat = db.Column(db.Integer, nullable=True)
    id_etape = db.Column(db.BigInteger, nullable=True)
    libelle = db.Column(db.String(256), nullable=True)
    qte = db.Column(db.String(15), nullable=True)
    id_pers = db.Column(db.Integer, nullable=True)
    nbre_erreur = db.Column(db.String(8), nullable=True)
    priority = db.Column(db.Integer, default=0, nullable=True)
    duree = db.Column(db.Integer, nullable=True)
    qte_op = db.Column(db.String(5), nullable=True)
    date_deb = db.Column(db.String(8), nullable=True)
    h_deb = db.Column(db.String(8), nullable=True)
    id_alm_sous_sous_spe = db.Column(db.Integer, nullable=True)
    id_det_ref = db.Column(db.Integer, nullable=True)
    duree_max = db.Column(db.Integer, nullable=True)
    qte_reele = db.Column(db.Integer, nullable=True)
    verifqte = db.Column(db.Boolean, nullable=True)

    # 🔗 Relations avec primaryjoin et foreign()
    lot_client = relationship(
        "LotClient",
        primaryjoin=foreign(id_lotclient) == LotClient.id_lotclient,
        lazy="joined",
        viewonly=True
    )

    dossier = relationship(
        "Dossier",
        primaryjoin=foreign(id_dossier) == Dossier.id_dossier,
        lazy="joined",
        viewonly=True
    )

    # ldts = relationship(
    #     "Ldt",
    #     primaryjoin=foreign(id_lot) == Ldt.id_lot,
    #     lazy="joined",
    #     viewonly=True
    # )

    def to_dict(self):
        """Convertir l’objet en dictionnaire (utile pour jsonify)"""
        return {
            "idLot": self.id_lot,
            "idLotClient": self.id_lotclient,
            "idEtat": self.id_etat,
            "idEtape": self.id_etape,
            "libelle": self.libelle,
            "qte": self.qte,
            "idPers": self.id_pers,
            "nbreErreur": self.nbre_erreur,
            "priority": self.priority,
            "duree": self.duree,
            "idDossier": self.id_dossier,
            "qteOp": self.qte_op,
            "dateDeb": self.date_deb,
            "hDeb": self.h_deb,
            "idAlmSousSousSpe": self.id_alm_sous_sous_spe,
            "idDetRef": self.id_det_ref,
            "dureeMax": self.duree_max,
            "qteReele": self.qte_reele,
            "verifQte": self.verifqte,

            # # Relations incluses
            # "lotClient": self.lot_client.to_dict() if self.lot_client else None,
            # "dossier": self.dossier.to_dict() if self.dossier else None,
            # "ldts": [ldt.to_dict() for ldt in self.ldts] if self.ldts else [],
        }
