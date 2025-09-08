from WEB_SERVICE.db import db

# ----------------------------
# Table: notifications
# ----------------------------
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.BigInteger, primary_key=True)
    actor_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    recipient_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    notifiable_type = db.Column(db.String)
    notifiable_id = db.Column(db.BigInteger)
    read_at = db.Column(db.DateTime)
    message = db.Column(db.Text)
    event = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    actor = db.relationship('User', foreign_keys=[actor_id], back_populates='notifications_sent')
    recipient = db.relationship('User', foreign_keys=[recipient_id], back_populates='notifications_received')
