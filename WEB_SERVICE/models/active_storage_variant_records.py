from WEB_SERVICE.db import db

# ----------------------------
# Table active_storage_variant_records
# ----------------------------
class ActiveStorageVariantRecord(db.Model):
    __tablename__ = 'active_storage_variant_records'

    id = db.Column(db.BigInteger, primary_key=True)
    blob_id = db.Column(db.BigInteger, db.ForeignKey('active_storage_blobs.id'), nullable=False)
    variation_digest = db.Column(db.String, nullable=False)

    # Relations
    blob = db.relationship('ActiveStorageBlob', back_populates='variants')