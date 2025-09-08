from WEB_SERVICE.db import db


# ----------------------------
# Table: calendar_cohorts
# ----------------------------
class CalendarCohort(db.Model):
    __tablename__ = 'calendar_cohorts'

    id = db.Column(db.BigInteger, primary_key=True)
    calendar_id = db.Column(db.BigInteger, db.ForeignKey('calendars.id'))
    cohort_id = db.Column(db.BigInteger)

    # Relations
    calendar = db.relationship('Calendar', back_populates='cohorts')
    cohort = db.relationship('Cohort', back_populates='calendar_cohorts')