from WEB_SERVICE.db import db

# ----------------------------
# Table: schools
# ----------------------------
class School(db.Model):
    __tablename__ = 'schools'
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    about = db.Column(db.Text)
    configuration = db.Column(db.JSON, nullable=False, default={})

    # Relations
    communities = db.relationship('Community', back_populates='school')
    domains = db.relationship('Domain', back_populates='school')
    organisations = db.relationship('Organisation', back_populates='school')
    links = db.relationship('SchoolLink', back_populates='school')
    strings = db.relationship('SchoolString', back_populates='school')
    standings = db.relationship('Standing', back_populates='school') 
    users = db.relationship('User', back_populates='school')
    markdown_attachments = db.relationship('MarkdownAttachment', back_populates='school')
