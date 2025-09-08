from WEB_SERVICE.db import db

# ----------------------------
# Table: domains
# ----------------------------
class Domain(db.Model):
    __tablename__ = 'domains'

    id = db.Column(db.BigInteger, primary_key=True)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'))
    fqdn = db.Column(db.String, unique=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    primary = db.Column(db.Boolean, default=False)

    # Relations
    school = db.relationship('School', back_populates='domains')

