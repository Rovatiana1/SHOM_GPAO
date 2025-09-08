from WEB_SERVICE.db import db

# ----------------------------
# Table: resource_versions
# ----------------------------
class ResourceVersion(db.Model):
    __tablename__ = 'resource_versions'

    id = db.Column(db.BigInteger, primary_key=True)
    value = db.Column(db.JSON)
    versionable_type = db.Column(db.String)
    versionable_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
