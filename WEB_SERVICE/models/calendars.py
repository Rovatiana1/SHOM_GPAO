from WEB_SERVICE.db import db

# ----------------------------
# Table: calendars
# ----------------------------
class Calendar(db.Model):
    __tablename__ = 'calendars'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger)
    name = db.Column(db.String)
    description = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    course = db.relationship('Course', back_populates='calendars')
    events = db.relationship('CalendarEvent', back_populates='calendar')
    cohorts = db.relationship('CalendarCohort', back_populates='calendar')