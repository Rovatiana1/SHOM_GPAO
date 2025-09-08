from WEB_SERVICE.db import db

# ----------------------------
# Table: teams
# ----------------------------
class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    cohort_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relation
    students = db.relationship('Student', back_populates='team')
    cohort = db.relationship('Cohort', back_populates='teams')