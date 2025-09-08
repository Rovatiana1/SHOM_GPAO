from WEB_SERVICE.db import db

# ----------------------------
# Table: organisation_admins
# ----------------------------
class OrganisationAdmin(db.Model):
    __tablename__ = 'organisation_admins'

    id = db.Column(db.BigInteger, primary_key=True)
    organisation_id = db.Column(db.BigInteger, db.ForeignKey('organisations.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='organisation_admins')
    organisation = db.relationship('Organisation', back_populates='organisation_admins')


