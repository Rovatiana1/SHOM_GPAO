from WEB_SERVICE.db import db

# ----------------------------
# Table: organisations
# ----------------------------
class Organisation(db.Model):
    __tablename__ = 'organisations'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    school = db.relationship('School', back_populates='organisations')
    users = db.relationship('User', back_populates='organisation')
    organisation_admins = db.relationship('OrganisationAdmin', back_populates='organisation')
