from WEB_SERVICE.db import db

# ----------------------------
# Table: webhook_endpoints
# ----------------------------
class WebhookEndpoint(db.Model):
    __tablename__ = 'webhook_endpoints'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, nullable=False)
    webhook_url = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, default=True)
    events = db.Column(db.JSON)
    hmac_key = db.Column(db.String, nullable=False)

    course = db.relationship('Course', back_populates='webhook_endpoints')
