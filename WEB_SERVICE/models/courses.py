from WEB_SERVICE.db import db

# ----------------------------
# Table: courses
# ----------------------------
class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    school_id = db.Column(db.BigInteger)
    description = db.Column(db.String)
    enable_leaderboard = db.Column(db.Boolean, default=False)
    public_signup = db.Column(db.Boolean, default=False)
    about = db.Column(db.Text)
    featured = db.Column(db.Boolean, default=True)
    can_connect = db.Column(db.Boolean, default=True)
    progression_behavior = db.Column(db.String)
    progression_limit = db.Column(db.Integer)
    archived_at = db.Column(db.DateTime)
    public_preview = db.Column(db.Boolean, default=False)
    processing_url = db.Column(db.String)
    highlights = db.Column(db.JSON, default=[])
    default_cohort_id = db.Column(db.BigInteger)
    discord_account_required = db.Column(db.Boolean, default=False)
    github_team_id = db.Column(db.Integer)

    # Relations
    applicants = db.relationship('Applicant', back_populates='course')
    certificates = db.relationship('Certificate', back_populates='course')
    cohorts = db.relationship('Cohort', back_populates='course')
    teams = db.relationship('Team', back_populates='course')
    students = db.relationship('Student', back_populates='course')
    calendars = db.relationship('Calendar', back_populates='course')
    authors = db.relationship('CourseAuthor', back_populates='course')
    exports = db.relationship('CourseExport', back_populates='course')
    community_connections = db.relationship('CommunityCourseConnection', back_populates='course')
