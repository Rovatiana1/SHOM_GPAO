from WEB_SERVICE.db import db

# ----------------------------
# Table: flipper_features
# ----------------------------
class FlipperFeature(db.Model):
    __tablename__ = 'flipper_features'

    id = db.Column(db.BigInteger, primary_key=True)
    key = db.Column(db.String, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    gates = db.relationship('FlipperGate', back_populates='feature')
