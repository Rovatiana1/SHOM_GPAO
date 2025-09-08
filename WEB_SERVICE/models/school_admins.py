from WEB_SERVICE.db import db

# ----------------------------
# Table: school_admins
# ----------------------------
class SchoolAdmin(db.Model):
    __tablename__ = 'school_admins'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='school_admin')
