from WEB_SERVICE.db import db


# ----------------------------
# Table: bounce_reports
# ----------------------------
class BounceReport(db.Model):
    __tablename__ = 'bounce_reports'

    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    bounce_type = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
