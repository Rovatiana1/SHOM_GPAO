from WEB_SERVICE.db import db

# ----------------------------
# Table: startup_feedback
# ----------------------------
class StartupFeedback(db.Model):
    __tablename__ = 'startup_feedback'

    id = db.Column(db.Integer, primary_key=True)
    feedback = db.Column(db.Text)
    reference_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    sent_at = db.Column(db.DateTime)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'))
    activity_type = db.Column(db.String)
    attachment = db.Column(db.String)
    timeline_event_id = db.Column(db.Integer, db.ForeignKey('timeline_events.id'))

    # Relations
    faculty = db.relationship('Faculty', back_populates='startup_feedbacks')
    timeline_event = db.relationship('TimelineEvent', back_populates='startup_feedbacks')