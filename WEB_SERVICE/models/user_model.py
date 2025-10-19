from WEB_SERVICE.db import db

class User(db.Model):
    __tablename__ = "r_personnel"

    id_pers = db.Column(db.Integer, primary_key=True)   # Clé primaire
    ldap_name = db.Column(db.String(25), unique=True, nullable=False)  # login LDAP
    mdp = db.Column(db.String(40), nullable=True)       # mot de passe local (optionnel si LDAP)
    nom = db.Column(db.String(128), nullable=False)
    prenom = db.Column(db.String(64), nullable=False)
    id_droit = db.Column(db.Integer, nullable=True)     # rôle/droit utilisateur
    email = db.Column(db.String(40), nullable=True)

    def __repr__(self):
        return f"<User {self.ldap_name}>"

    @property
    def username(self):
        """Concatène prénom + nom pour affichage."""
        return f"{self.prenom} {self.nom}"

    @property
    def roles(self):
        """
        Retourne une liste de rôles à partir du champ id_droit.
        Pour l’instant c’est un mapping simple : 
        1 = admin, 2 = manager, 3 = user…
        """
        mapping = {
            1: "ADMIN",
            2: "MANAGER",
            3: "USER"
        }
        if self.id_droit in mapping:
            return [mapping[self.id_droit]]
        return ["USER"]
    
    def to_dict(self):
        return {
            "id_pers": self.id_pers,
            "ldap_name": self.ldap_name,
            "prenom": self.prenom,
            "nom": self.nom,
            "email": self.email,
            "id_droit": self.id_droit,
            "roles": self.roles
        }