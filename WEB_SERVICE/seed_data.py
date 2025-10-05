from WEB_SERVICE.app import app, db
from WEB_SERVICE.models.etat_model import Etat
from WEB_SERVICE.models.etape_model import Etape
from WEB_SERVICE.models.lot_model import Lot
from WEB_SERVICE.models.lot_client_model import LotClient
from WEB_SERVICE.models.lot_commentaire_model import LotCommentaire
from WEB_SERVICE.models.ldt_model import Ldt
from WEB_SERVICE.models.dossier_model import Dossier
from WEB_SERVICE.models.user_model import User

with app.app_context():
    # ---------------------------
    # TABLE : p_etat
    # ---------------------------
    etats = [
        Etat(id_etat=1, libelle="En attente"),
        Etat(id_etat=2, libelle="En cours"),
        Etat(id_etat=3, libelle="Terminé"),
        Etat(id_etat=4, libelle="Annulé"),
        Etat(id_etat=5, libelle="Annomalie"),
        Etat(id_etat=6, libelle="Bloquer"),
    ]
    db.session.add_all(etats)

    # ---------------------------
    # TABLE : user
    # ---------------------------
    user1 = User(id_pers=1,ldap_name="0001", nom="Dupont", prenom="Jean", email="jean.dupont@beys.com")
    user2 = User(id_pers=2,ldap_name="0002", nom="Durand", prenom="Marie", email="marie.durand@beys.com")
    db.session.add_all([user1, user2])

    # ---------------------------
    # TABLE : dossier
    # ---------------------------
    dossier1 = Dossier(id_dossier=1, num_dossier="Projet Alpha")
    dossier2 = Dossier(id_dossier=2, num_dossier="Projet Beta")
    db.session.add_all([dossier1, dossier2])

    # ---------------------------
    # TABLE : lot
    # ---------------------------
    lot1 = Lot(id_lot=1, libelle="Lot 1", id_dossier=1)
    lot2 = Lot(id_lot=2, libelle="Lot 2", id_dossier=2)
    db.session.add_all([lot1, lot2])

    # ---------------------------
    # TABLE : lot_client
    # ---------------------------
    lot_client1 = LotClient(id_lotclient=1, nom_client="Client A")
    lot_client2 = LotClient(id_lotclient=2, nom_client="Client B")
    db.session.add_all([lot_client1, lot_client2])

    # ---------------------------
    # TABLE : lot_commentaire
    # ---------------------------
    com1 = LotCommentaire(id_commentaire=1, texte="Début du lot", auteur="Jean Dupont")
    com2 = LotCommentaire(id_commentaire=2, texte="Problème mineur résolu", auteur="Marie Durand")
    db.session.add_all([com1, com2])

    # ---------------------------
    # TABLE : etape
    # ---------------------------
    etape1 = Etape(id_etape=1, id_lot=1, nom="Préparation", ordre=1)
    etape2 = Etape(id_etape=2, id_lot=1, nom="Contrôle qualité", ordre=2)
    db.session.add_all([etape1, etape2])

    # ---------------------------
    # TABLE : ldt
    # ---------------------------
    ldt1 = Ldt(id_ldt=1, id_lot=1, valeur="OK")
    ldt2 = Ldt(id_ldt=2, id_lot=2, valeur="Non conforme")
    db.session.add_all([ldt1, ldt2])

    # Enregistrement des données
    db.session.commit()
    print("✅ Données de test insérées avec succès !")
