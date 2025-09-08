from WEB_SERVICE.db import db

# ----------------------------
# Table active_storage_attachments
# ----------------------------
class ActiveStorageAttachment(db.Model):
    __tablename__ = 'active_storage_attachments'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String, nullable=False)
    record_type = db.Column(db.String, nullable=False)
    record_id = db.Column(db.BigInteger, nullable=False)
    blob_id = db.Column(db.BigInteger, db.ForeignKey('active_storage_blobs.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relations
    blob = db.relationship('ActiveStorageBlob', back_populates='attachments')
