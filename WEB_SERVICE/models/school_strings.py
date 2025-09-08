from WEB_SERVICE.db import db

# ----------------------------
# Table: school_strings
# ----------------------------
class SchoolString(db.Model):
    __tablename__ = 'school_strings'

    id = db.Column(db.BigInteger, primary_key=True)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'))
    key = db.Column(db.String)
    value = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    school = db.relationship('School', back_populates='strings')


