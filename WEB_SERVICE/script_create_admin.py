# script_create_admin.py (à lancer en console, non exposé via web)
from WEB_SERVICE.db import db
from WEB_SERVICE.models.user_model import User

def create_admin(ldap_name, username):
    user = User.query.filter_by(ldap_name=ldap_name).first()
    if not user:
        user = User(ldap_name=ldap_name, username=username, roles="admin")
        db.session.add(user)
    else:
        roles = set((user.roles or "").split(","))
        roles.add("admin")
        user.roles = ",".join(sorted(roles))
    db.session.commit()
    print("Admin créé / mis à jour.")

if __name__ == "__main__":
    create_admin("admin_ldap", "Administrateur")
