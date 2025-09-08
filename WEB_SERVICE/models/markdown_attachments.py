from WEB_SERVICE.db import db

# ----------------------------
# Table: markdown_attachments
# ----------------------------
class MarkdownAttachment(db.Model):
    __tablename__ = 'markdown_attachments'

    id = db.Column(db.BigInteger, primary_key=True)
    token = db.Column(db.String)
    last_accessed_at = db.Column(db.DateTime)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='markdown_attachments')
    school = db.relationship('School', back_populates='markdown_attachments')


