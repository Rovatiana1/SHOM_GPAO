from WEB_SERVICE.db import db

# ----------------------------
# Table: faculty
# ----------------------------
class Faculty(db.Model):
    __tablename__ = 'faculty'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String)
    sort_index = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    token = db.Column(db.String)
    current_commitment = db.Column(db.String)
    commitment = db.Column(db.String)
    compensation = db.Column(db.String)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    public = db.Column(db.Boolean, default=False)
    connect_link = db.Column(db.String)
    notify_for_submission = db.Column(db.Boolean, default=False)
    exited = db.Column(db.Boolean, default=False)

    # Relations
    user = db.relationship('User', back_populates='faculty')
    coach_notes = db.relationship('CoachNote', back_populates='author')
    startup_feedbacks = db.relationship('StartupFeedback', back_populates='faculty')
    cohort_enrollments = db.relationship('FacultyCohortEnrollment', back_populates='faculty')
    student_enrollments = db.relationship('FacultyStudentEnrollment', back_populates='faculty')