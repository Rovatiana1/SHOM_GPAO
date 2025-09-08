from WEB_SERVICE.db import db

# ----------------------------
# Table: course_exports
# ----------------------------
class CourseExport(db.Model):
    __tablename__ = 'course_exports'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger)
    course_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    reviewed_only = db.Column(db.Boolean, default=False)
    json_data = db.Column(db.Text)
    export_type = db.Column(db.String)
    include_inactive_students = db.Column(db.Boolean, default=False)

    # Relations
    user = db.relationship('User', back_populates='course_exports')
    course = db.relationship('Course', back_populates='exports')
    cohorts_links = db.relationship('CourseExportCohort', back_populates='course_export', cascade='all, delete-orphan')
