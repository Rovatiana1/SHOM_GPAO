from WEB_SERVICE.db import db

# ----------------------------
# Table: timeline_event_owners
# ----------------------------
class TimelineEventOwner(db.Model):
    __tablename__ = 'timeline_event_owners'

    id = db.Column(db.BigInteger, primary_key=True)
    timeline_event_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    latest = db.Column(db.Boolean, default=False)
    student_id = db.Column(db.BigInteger)

    # Relation
    timeline_event = db.relationship('TimelineEvent', backref='owners')
    student = db.relationship('Student', backref='timeline_event_owners')