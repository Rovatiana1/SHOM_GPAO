from WEB_SERVICE.db import db

# ----------------------------
# Table: standings
# ----------------------------
class Standing(db.Model):
    __tablename__ = 'standings'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    color = db.Column(db.String)
    description = db.Column(db.Text)
    default = db.Column(db.Boolean, default=False, nullable=False)
    archived_at = db.Column(db.DateTime)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    school = db.relationship('School', back_populates='standings')
    user_standings = db.relationship('UserStanding', back_populates='standing')

