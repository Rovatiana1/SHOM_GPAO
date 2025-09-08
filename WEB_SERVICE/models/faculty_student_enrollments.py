from WEB_SERVICE.db import db

# ----------------------------
# Table: faculty_student_enrollments
# ----------------------------
class FacultyStudentEnrollment(db.Model):
    __tablename__ = 'faculty_student_enrollments'

    id = db.Column(db.BigInteger, primary_key=True)
    faculty_id = db.Column(db.BigInteger, db.ForeignKey('faculty.id'))
    student_id = db.Column(db.BigInteger, db.ForeignKey('students.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    faculty = db.relationship('Faculty', back_populates='student_enrollments')
    student = db.relationship('Student', back_populates='faculty_enrollments')