from WEB_SERVICE.db import db

# ----------------------------
# Table: moderation_reports
# ----------------------------
class ModerationReport(db.Model):
    __tablename__ = 'moderation_reports'

    id = db.Column(db.BigInteger, primary_key=True)
    reason = db.Column(db.Text)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    reportable_type = db.Column(db.String, nullable=False)
    reportable_id = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='moderation_reports')

