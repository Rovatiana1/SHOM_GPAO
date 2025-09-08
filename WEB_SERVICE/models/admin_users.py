from WEB_SERVICE.db import db

# ----------------------------
# Table: admin_users
# ----------------------------
class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.BigInteger, primary_key=True)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)
    username = db.Column(db.String)
    fullname = db.Column(db.String)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    email = db.Column(db.String)

    # Relations
    user = db.relationship('User', back_populates='admin_user')


