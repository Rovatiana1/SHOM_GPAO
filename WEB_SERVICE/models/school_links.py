from WEB_SERVICE.db import db

# ----------------------------
# Table: school_links
# ----------------------------
class SchoolLink(db.Model):
    __tablename__ = 'school_links'

    id = db.Column(db.BigInteger, primary_key=True)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'))
    title = db.Column(db.String)
    url = db.Column(db.String)
    kind = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    sort_index = db.Column(db.Integer, default=0)

    # Relations
    school = db.relationship('School', back_populates='links')
