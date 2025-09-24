from WEB_SERVICE.db import db
from sqlalchemy.sql import func

class LotCommentaire(db.Model):
    __tablename__ = "p_lot_commentaires"

    id_commentaire = db.Column(db.BigInteger, primary_key=True)
    id_lot = db.Column(db.BigInteger, nullable=True)
    id_dossier = db.Column(db.BigInteger, nullable=True)
    id_lotclient = db.Column(db.BigInteger, nullable=True)
    libelle_lot = db.Column(db.String, nullable=True)
    commentaire = db.Column(db.String, nullable=True)
    date_creation = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    id_pers_session = db.Column(db.BigInteger, nullable=True)

    def to_dict(self):
        return {
            "idCommentaire": self.id_commentaire,
            "idLot": self.id_lot,
            "idDossier": self.id_dossier,
            "idLotClient": self.id_lotclient,
            "libelleLot": self.libelle_lot,
            "commentaire": self.commentaire,
            "dateCreation": self.date_creation.isoformat() if self.date_creation else None,
            "idPersSession": self.id_pers_session,
        }
