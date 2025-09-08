from WEB_SERVICE.db import db

# ----------------------------
# Table: cohorts
# ----------------------------
class Cohort(db.Model):
    __tablename__ = 'cohorts'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    ends_at = db.Column(db.DateTime)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    discord_role_ids = db.Column(db.ARRAY(db.String), default=[])

    # Relation
    course = db.relationship('Course', back_populates='cohorts')
    students = db.relationship('Student', back_populates='cohort')
    teams = db.relationship('Team', back_populates='cohort')
    faculty_enrollments = db.relationship('FacultyCohortEnrollment', back_populates='cohort')