from WEB_SERVICE.db import db

# ----------------------------
# Table: ar_internal_metadata
# ----------------------------
class ArInternalMetadata(db.Model):
    __tablename__ = 'ar_internal_metadata'

    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)