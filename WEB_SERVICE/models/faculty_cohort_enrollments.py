from WEB_SERVICE.db import db

# ----------------------------
# Table: faculty_cohort_enrollments
# ----------------------------
class FacultyCohortEnrollment(db.Model):
    __tablename__ = 'faculty_cohort_enrollments'

    id = db.Column(db.BigInteger, primary_key=True)
    faculty_id = db.Column(db.BigInteger, db.ForeignKey('faculty.id'))
    cohort_id = db.Column(db.BigInteger, db.ForeignKey('cohorts.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    faculty = db.relationship('Faculty', back_populates='cohort_enrollments')
    cohort = db.relationship('Cohort', back_populates='faculty_enrollments')