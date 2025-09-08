from WEB_SERVICE.db import db

# ----------------------------
# Table: text_versions
# ----------------------------
class TextVersion(db.Model):
    __tablename__ = 'text_versions'

    id = db.Column(db.BigInteger, primary_key=True)
    value = db.Column(db.Text)
    versionable_type = db.Column(db.String)
    versionable_id = db.Column(db.BigInteger)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    edited_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String)

    # Relations
    user = db.relationship('User', back_populates='text_versions')
