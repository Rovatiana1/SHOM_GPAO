from WEB_SERVICE.db import db

# ----------------------------
# Table: target_versions
# ----------------------------
class TargetVersion(db.Model):
    __tablename__ = 'target_versions'

    id = db.Column(db.BigInteger, primary_key=True)
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    target = db.relationship('Target', back_populates='versions')
