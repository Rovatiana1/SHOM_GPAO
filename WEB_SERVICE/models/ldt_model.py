from WEB_SERVICE.db import db
from WEB_SERVICE.models.lot_model import Lot
from WEB_SERVICE.models.lot_client_model import LotClient
from WEB_SERVICE.models.dossier_model import Dossier

class Ldt(db.Model):
    __tablename__ = "p_ldt"

    id_ldt = db.Column(db.BigInteger, primary_key=True)
    id_pers = db.Column(db.Integer, nullable=True)

    id_dossier = db.Column(db.Integer, db.ForeignKey("p_dossier.id_dossier"), nullable=True)
    id_lotclient = db.Column(db.BigInteger, db.ForeignKey("p_lot_client.id_lotclient"), nullable=True)
    id_lot = db.Column(db.BigInteger, db.ForeignKey("p_lot.id_lot"), nullable=True)

    id_etat = db.Column(db.Integer, nullable=True)
    id_etape = db.Column(db.Integer, nullable=True)
    id_type_ldt = db.Column(db.Integer, nullable=True)
    machine = db.Column(db.String(50), nullable=True)
    h_deb = db.Column(db.String(8), nullable=True)
    h_fin = db.Column(db.String(8), nullable=True)
    quantite = db.Column(db.String(10), nullable=True)
    nbre_erreur = db.Column(db.String(8), nullable=True)
    commentaire = db.Column(db.String(255), nullable=True)
    date_deb_ldt = db.Column(db.String(8), nullable=True)
    lot_op = db.Column(db.String(64), nullable=True)
    date_fin_ldt = db.Column(db.String(8), nullable=True)
    address_ip = db.Column(db.String(15), nullable=True)
    ver = db.Column(db.Integer, nullable=True)
    mac = db.Column(db.String(20), nullable=True)
    id_ldt_neocles = db.Column(db.Integer, nullable=True)
    modif_batch = db.Column(db.Boolean, default=False, nullable=True)
    id_alm_sous_sous_spe = db.Column(db.Integer, nullable=True)
    heure_sup = db.Column(db.Boolean, nullable=True)
    by_excel_teletravail = db.Column(db.Boolean, default=False, nullable=True)
    duree_ldt = db.Column(db.Integer, nullable=True)
    h_deb_tmstp = db.Column(db.DateTime, nullable=True)
    h_fin_tmstp = db.Column(db.DateTime, nullable=True)

    lot = db.relationship("Lot", backref="ldts", lazy=True)
    lot_client = db.relationship("LotClient", backref="ldts", lazy=True)
    dossier = db.relationship("Dossier", backref="ldts", lazy=True)

    def to_dict(self):
        return {
            "idLdt": self.id_ldt,
            "idPers": self.id_pers,
            "idDossier": self.id_dossier,
            "idLotClient": self.id_lotclient,
            "idLot": self.id_lot,
            "idEtat": self.id_etat,
            "idEtape": self.id_etape,
            "idTypeLdt": self.id_type_ldt,
            "machine": self.machine,
            "hDeb": self.h_deb,
            "hFin": self.h_fin,
            "quantite": self.quantite,
            "nbreErreur": self.nbre_erreur,
            "commentaire": self.commentaire,
            "dateDebLdt": self.date_deb_ldt,
            "lotOp": self.lot_op,
            "dateFinLdt": self.date_fin_ldt,
            "addressIp": self.address_ip,
            "ver": self.ver,
            "mac": self.mac,
            "idLdtNeocles": self.id_ldt_neocles,
            "modifBatch": self.modif_batch,
            "idAlmSousSousSpe": self.id_alm_sous_sous_spe,
            "heureSup": self.heure_sup,
            "byExcelTeletravail": self.by_excel_teletravail,
            "dureeLdt": self.duree_ldt,
            "hDebTmstp": self.h_deb_tmstp.isoformat() if self.h_deb_tmstp else None,
            "hFinTmstp": self.h_fin_tmstp.isoformat() if self.h_fin_tmstp else None,
            "lot": self.lot.to_dict() if self.lot else None,
            "lotClient": self.lot_client.to_dict() if self.lot_client else None,
            "dossier": self.dossier.to_dict() if self.dossier else None,
        }
