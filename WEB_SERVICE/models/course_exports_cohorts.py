from WEB_SERVICE.db import db

# ----------------------------
# Table: course_exports_cohorts
# ----------------------------
class CourseExportCohort(db.Model):
    __tablename__ = 'course_exports_cohorts'

    id = db.Column(db.BigInteger, primary_key=True)
    cohort_id = db.Column(db.BigInteger)
    course_export_id = db.Column(db.BigInteger)

    # Relations
    cohort = db.relationship('Cohort', back_populates='course_exports_links')
    course_export = db.relationship('CourseExport', back_populates='cohorts_links')