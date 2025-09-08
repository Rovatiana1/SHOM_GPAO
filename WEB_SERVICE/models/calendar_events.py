from WEB_SERVICE.db import db

# ----------------------------
# Table: calendar_events
# ----------------------------
class CalendarEvent(db.Model):
    __tablename__ = 'calendar_events'

    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.Text)
    calendar_id = db.Column(db.BigInteger, db.ForeignKey('calendars.id'))
    color = db.Column(db.String)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    link_url = db.Column(db.String)
    link_title = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    calendar = db.relationship('Calendar', back_populates='events')