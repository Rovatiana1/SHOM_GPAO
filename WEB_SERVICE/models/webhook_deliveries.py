from WEB_SERVICE.db import db

# ----------------------------
# Table: webhook_deliveries
# ----------------------------
class WebhookDelivery(db.Model):
    __tablename__ = 'webhook_deliveries'

    id = db.Column(db.BigInteger, primary_key=True)
    event = db.Column(db.String, nullable=False)
    status = db.Column(db.String)
    response_headers = db.Column(db.JSON)
    response_body = db.Column(db.Text)
    payload = db.Column(db.JSON, default={})
    webhook_url = db.Column(db.String, nullable=False)
    sent_at = db.Column(db.DateTime)
    error_class = db.Column(db.String)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    course = db.relationship('Course', back_populates='webhook_deliveries')
