from WEB_SERVICE.db import db

# ----------------------------
# Table: TimelineEvent
# ----------------------------
class TimelineEvent(db.Model):
    __tablename__ = 'timeline_events'

    id = db.Column(db.BigInteger, primary_key=True)
    image = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'))
    score = db.Column(db.Numeric(2, 1))
    evaluator_id = db.Column(db.BigInteger, db.ForeignKey('faculty.id'))
    passed_at = db.Column(db.DateTime)
    quiz_score = db.Column(db.String)
    evaluated_at = db.Column(db.DateTime)
    checklist = db.Column(db.JSON, default=[])
    reviewer_id = db.Column(db.BigInteger, db.ForeignKey('faculty.id'))
    reviewer_assigned_at = db.Column(db.DateTime)
    archived_at = db.Column(db.DateTime)
    anonymous = db.Column(db.Boolean, default=False)
    pinned = db.Column(db.Boolean, default=False)
    hidden_at = db.Column(db.DateTime)
    hidden_by_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))

    # Relations
    target = db.relationship('Target', back_populates='timeline_events')
    hidden_by = db.relationship('User', back_populates='hidden_timeline_events')
    comments = db.relationship('SubmissionComment', back_populates='submission')
    reports = db.relationship('SubmissionReport', back_populates='submission')
    startup_feedbacks = db.relationship('StartupFeedback', back_populates='timeline_event')
    files = db.relationship('TimelineEventFile', back_populates='timeline_event')
    evaluator = db.relationship('Faculty', foreign_keys=[evaluator_id], back_populates='evaluated_events')
    reviewer = db.relationship('Faculty', foreign_keys=[reviewer_id], back_populates='reviewed_events')