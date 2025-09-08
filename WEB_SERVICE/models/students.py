from WEB_SERVICE.db import db

# ----------------------------
# Table: students
# ----------------------------
class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)
    auth_token = db.Column(db.String)
    roles = db.Column(db.String)
    user_id = db.Column(db.Integer)
    excluded_from_leaderboard = db.Column(db.Boolean, default=False)
    dropped_out_at = db.Column(db.DateTime)
    cohort_id = db.Column(db.BigInteger)
    team_id = db.Column(db.BigInteger)
    completed_at = db.Column(db.DateTime)
    github_repository = db.Column(db.String)


    # Relations
    user = db.relationship('User', back_populates='student_profile')
    timeline_event_owners = db.relationship('TimelineEventOwner', back_populates='student')
    cohort = db.relationship('Cohort', back_populates='students')
    team = db.relationship('Team', back_populates='students')
    faculty_enrollments = db.relationship('FacultyStudentEnrollment', back_populates='student')
    leaderboard_entries = db.relationship('LeaderboardEntry', back_populates='student')

