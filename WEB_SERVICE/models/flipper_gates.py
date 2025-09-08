from WEB_SERVICE.db import db

# ----------------------------
# Table: flipper_gates
# ----------------------------
class FlipperGate(db.Model):
    __tablename__ = 'flipper_gates'

    id = db.Column(db.BigInteger, primary_key=True)
    feature_key = db.Column(db.String, db.ForeignKey('flipper_features.key'), nullable=False)
    key = db.Column(db.String, nullable=False)
    value = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    feature = db.relationship('FlipperFeature', back_populates='gates')
