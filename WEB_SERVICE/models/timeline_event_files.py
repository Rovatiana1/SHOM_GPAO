from WEB_SERVICE.db import db

# ----------------------------
# Table: timeline_event_files
# ----------------------------
class TimelineEventFile(db.Model):
    __tablename__ = 'timeline_event_files'

    id = db.Column(db.Integer, primary_key=True)
    timeline_event_id = db.Column(db.Integer, db.ForeignKey('timeline_events.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    title = db.Column(db.String)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)

    # Relations
    user = db.relationship('User', back_populates='timeline_event_files')
    timeline_event = db.relationship('TimelineEvent', back_populates='files')