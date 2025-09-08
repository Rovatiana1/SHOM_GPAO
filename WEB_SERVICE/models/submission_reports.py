from WEB_SERVICE.db import db

# ----------------------------
# Table: submission_reports
# ----------------------------
class SubmissionReport(db.Model):
    __tablename__ = 'submission_reports'

    id = db.Column(db.BigInteger, primary_key=True)
    status = db.Column(db.String, default='queued')
    conclusion = db.Column(db.String)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    submission_id = db.Column(db.BigInteger, db.ForeignKey('timeline_events.id'))
    report = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    reporter = db.Column(db.String, nullable=False)
    target_url = db.Column(db.String)
    heading = db.Column(db.String)

    # Relations
    submission = db.relationship('TimelineEvent', back_populates='submission_reports')