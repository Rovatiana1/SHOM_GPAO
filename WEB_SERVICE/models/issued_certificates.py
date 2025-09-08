from WEB_SERVICE.db import db

# ----------------------------
# Table: issued_certificates
# ----------------------------
class IssuedCertificate(db.Model):
    __tablename__ = 'issued_certificates'

    id = db.Column(db.BigInteger, primary_key=True)
    certificate_id = db.Column(db.BigInteger, nullable=False)
    user_id = db.Column(db.BigInteger)
    name = db.Column(db.String, nullable=False)
    serial_number = db.Column(db.CITEXT, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    issuer_id = db.Column(db.BigInteger)
    revoker_id = db.Column(db.BigInteger)
    revoked_at = db.Column(db.DateTime)

    # Relations
    certificate = db.relationship('Certificate', back_populates='issued_certificates')
    user = db.relationship('User', foreign_keys=[user_id], back_populates='issued_certificates')
    issuer = db.relationship('User', foreign_keys=[issuer_id], back_populates='issued_certificates_issued')
    revoker = db.relationship('User', foreign_keys=[revoker_id], back_populates='issued_certificates_revoked')

