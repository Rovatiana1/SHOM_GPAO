from WEB_SERVICE.db import db


# ----------------------------
# Table active_storage_blobs
# ----------------------------
class ActiveStorageBlob(db.Model):
    __tablename__ = 'active_storage_blobs'

    id = db.Column(db.BigInteger, primary_key=True)
    key = db.Column(db.String, nullable=False, unique=True)
    filename = db.Column(db.String, nullable=False)
    content_type = db.Column(db.String)
    metadata = db.Column(db.Text)
    byte_size = db.Column(db.BigInteger, nullable=False)
    checksum = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    service_name = db.Column(db.String, nullable=False)

    # Relations
    attachments = db.relationship('ActiveStorageAttachment', back_populates='blob')
    variants = db.relationship('ActiveStorageVariantRecord', back_populates='blob')