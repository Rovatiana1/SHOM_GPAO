from WEB_SERVICE.db import db

# ----------------------------
# Table: audit_records
# ----------------------------
class AuditRecord(db.Model):
    __tablename__ = 'audit_records'

    id = db.Column(db.BigInteger, primary_key=True)
    school_id = db.Column(db.BigInteger, nullable=False)
    audit_type = db.Column(db.String, nullable=False)
    metadata = db.Column(JSONB, nullable=True, default={})
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
