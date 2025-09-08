from WEB_SERVICE.db import db

# ----------------------------
# Table: submission_comments
# ----------------------------
class SubmissionComment(db.Model):
    __tablename__ = 'submission_comments'

    id = db.Column(db.BigInteger, primary_key=True)
    comment = db.Column(db.Text)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    submission_id = db.Column(db.BigInteger, db.ForeignKey('timeline_events.id'), nullable=False)
    hidden_by_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    hidden_at = db.Column(db.DateTime)
    archived_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', foreign_keys=[user_id], back_populates='submission_comments')
    hidden_by = db.relationship('User', foreign_keys=[hidden_by_id])
    submission = db.relationship('TimelineEvent', back_populates='submission_comments')