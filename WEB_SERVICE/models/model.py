from WEB_SERVICE.db import db

# ----------------------------
# Users
# ----------------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String)
    encrypted_password = db.Column(db.String, default='')
    name = db.Column(db.String)
    school_id = db.Column(db.BigInteger)
    organisation_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    moderation_reports = db.relationship('ModerationReport', back_populates='user')
    reactions = db.relationship('Reaction', back_populates='user')
    organisation_admins = db.relationship('OrganisationAdmin', back_populates='user')
    school_admin = db.relationship('SchoolAdmin', back_populates='user', uselist=False)
    submission_comments = db.relationship('SubmissionComment', back_populates='user')
    issued_certificates = db.relationship('IssuedCertificate', back_populates='user')
    timeline_events_hidden = db.relationship('TimelineEvent', back_populates='hidden_by', foreign_keys='TimelineEvent.hidden_by_id')


# ----------------------------
# ModerationReports
# ----------------------------
class ModerationReport(db.Model):
    __tablename__ = 'moderation_reports'

    id = db.Column(db.BigInteger, primary_key=True)
    reason = db.Column(db.Text)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    reportable_type = db.Column(db.String)
    reportable_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', back_populates='moderation_reports')


# ----------------------------
# OrganisationAdmins
# ----------------------------
class OrganisationAdmin(db.Model):
    __tablename__ = 'organisation_admins'

    id = db.Column(db.BigInteger, primary_key=True)
    organisation_id = db.Column(db.BigInteger, db.ForeignKey('organisations.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', back_populates='organisation_admins')
    organisation = db.relationship('Organisation', back_populates='organisation_admins')


# ----------------------------
# Reactions
# ----------------------------
class Reaction(db.Model):
    __tablename__ = 'reactions'

    id = db.Column(db.BigInteger, primary_key=True)
    reaction_value = db.Column(db.String)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    reactionable_type = db.Column(db.String, nullable=False)
    reactionable_id = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', back_populates='reactions')


# ----------------------------
# SchoolAdmins
# ----------------------------
class SchoolAdmin(db.Model):
    __tablename__ = 'school_admins'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', back_populates='school_admin')


# ----------------------------
# TimelineEvents
# ----------------------------
class TimelineEvent(db.Model):
    __tablename__ = 'timeline_events'

    id = db.Column(db.Integer, primary_key=True)
    target_id = db.Column(db.Integer, db.ForeignKey('targets.id'))
    evaluator_id = db.Column(db.Integer, db.ForeignKey('faculty.id'))
    reviewer_id = db.Column(db.BigInteger, db.ForeignKey('faculty.id'))
    hidden_by_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    evaluator = db.relationship('Faculty', foreign_keys=[evaluator_id], back_populates='evaluated_events')
    reviewer = db.relationship('Faculty', foreign_keys=[reviewer_id], back_populates='reviewed_events')
    hidden_by = db.relationship('User', back_populates='timeline_events_hidden')
    owners = db.relationship('TimelineEventOwner', back_populates='timeline_event')
    startup_feedbacks = db.relationship('StartupFeedback', back_populates='timeline_event')
    submission_comments = db.relationship('SubmissionComment', back_populates='submission')


# ----------------------------
# TimelineEventOwners
# ----------------------------
class TimelineEventOwner(db.Model):
    __tablename__ = 'timeline_event_owners'

    id = db.Column(db.BigInteger, primary_key=True)
    timeline_event_id = db.Column(db.BigInteger, db.ForeignKey('timeline_events.id'))
    student_id = db.Column(db.BigInteger, db.ForeignKey('students.id'))
    latest = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    timeline_event = db.relationship('TimelineEvent', back_populates='owners')
    student = db.relationship('Student', back_populates='timeline_event_owners')


# ----------------------------
# Students
# ----------------------------
class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    cohort_id = db.Column(db.BigInteger, db.ForeignKey('cohorts.id'))
    team_id = db.Column(db.BigInteger, db.ForeignKey('teams.id'))

    timeline_event_owners = db.relationship('TimelineEventOwner', back_populates='student')
    cohort = db.relationship('Cohort', back_populates='students')
    team = db.relationship('Team', back_populates='students')
    leaderboard_entries = db.relationship('LeaderboardEntry', back_populates='student')


# ----------------------------
# Teams
# ----------------------------
class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.BigInteger, primary_key=True)
    cohort_id = db.Column(db.BigInteger, db.ForeignKey('cohorts.id'))

    students = db.relationship('Student', back_populates='team')
    cohort = db.relationship('Cohort', back_populates='teams')


# ----------------------------
# Cohorts
# ----------------------------
class Cohort(db.Model):
    __tablename__ = 'cohorts'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))

    students = db.relationship('Student', back_populates='cohort')
    teams = db.relationship('Team', back_populates='cohort')
    course = db.relationship('Course', back_populates='cohorts')


# ----------------------------
# Courses
# ----------------------------
class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.BigInteger, primary_key=True)

    cohorts = db.relationship('Cohort', back_populates='course')
    course_authors = db.relationship('CourseAuthor', back_populates='course')
    course_exports = db.relationship('CourseExport', back_populates='course')
    applicants = db.relationship('Applicant', back_populates='course')
    certificates = db.relationship('Certificate', back_populates='course')
    community_connections = db.relationship('CommunityCourseConnection', back_populates='course')


# ----------------------------
# CourseAuthors
# ----------------------------
class CourseAuthor(db.Model):
    __tablename__ = 'course_authors'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))

    course = db.relationship('Course', back_populates='course_authors')
    user = db.relationship('User', backref='course_authors')


# ----------------------------
# CourseExports
# ----------------------------
class CourseExport(db.Model):
    __tablename__ = 'course_exports'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))

    course = db.relationship('Course', back_populates='course_exports')
    user = db.relationship('User', backref='course_exports')
    cohorts = db.relationship('CourseExportsCohort', back_populates='course_export')


# ----------------------------
# CourseExportsCohorts
# ----------------------------
class CourseExportsCohort(db.Model):
    __tablename__ = 'course_exports_cohorts'

    id = db.Column(db.BigInteger, primary_key=True)
    course_export_id = db.Column(db.BigInteger, db.ForeignKey('course_exports.id'))
    cohort_id = db.Column(db.BigInteger, db.ForeignKey('cohorts.id'))

    course_export = db.relationship('CourseExport', back_populates='cohorts')
    cohort = db.relationship('Cohort', backref='course_exports_cohorts')


# ----------------------------
# Applicants
# ----------------------------
class Applicant(db.Model):
    __tablename__ = 'applicants'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))

    course = db.relationship('Course', back_populates='applicants')


# ----------------------------
# Certificates
# ----------------------------
class Certificate(db.Model):
    __tablename__ = 'certificates'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))

    course = db.relationship('Course', back_populates='certificates')
    issued_certificates = db.relationship('IssuedCertificate', back_populates='certificate')


# ----------------------------
# IssuedCertificates
# ----------------------------
class IssuedCertificate(db.Model):
    __tablename__ = 'issued_certificates'

    id = db.Column(db.BigInteger, primary_key=True)
    certificate_id = db.Column(db.BigInteger, db.ForeignKey('certificates.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    issuer_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    revoker_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))

    certificate = db.relationship('Certificate', back_populates='issued_certificates')
    user = db.relationship('User', back_populates='issued_certificates')
    issuer = db.relationship('User', foreign_keys=[issuer_id])
    revoker = db.relationship('User', foreign_keys=[revoker_id])


# ----------------------------
# LeaderboardEntries
# ----------------------------
class LeaderboardEntry(db.Model):
    __tablename__ = 'leaderboard_entries'

    id = db.Column(db.BigInteger, primary_key=True)
    student_id = db.Column(db.BigInteger, db.ForeignKey('students.id'))

    student = db.relationship('Student', back_populates='leaderboard_entries')


# ----------------------------
# Autres tables (ex: QuizQuestions, AnswerOptions, PageReads...)
# Suivre le même pattern avec db.relationship et foreign keys
# ----------------------------

# ----------------------------
# QuizQuestions
# ----------------------------
class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    id = db.Column(db.BigInteger, primary_key=True)
    quiz_id = db.Column(db.BigInteger, db.ForeignKey('quizzes.id'))
    correct_answer_id = db.Column(db.BigInteger, db.ForeignKey('answer_options.id'))
    question = db.Column(db.Text)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    correct_answer = db.relationship('AnswerOption', back_populates='quiz_questions', foreign_keys=[correct_answer_id])
    answer_options = db.relationship('AnswerOption', back_populates='quiz_question', foreign_keys='AnswerOption.quiz_question_id')
    quiz = db.relationship('Quiz', back_populates='questions')


# ----------------------------
# AnswerOptions
# ----------------------------
class AnswerOption(db.Model):
    __tablename__ = 'answer_options'

    id = db.Column(db.BigInteger, primary_key=True)
    quiz_question_id = db.Column(db.BigInteger, db.ForeignKey('quiz_questions.id'))
    value = db.Column(db.Text)
    hint = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    quiz_question = db.relationship('QuizQuestion', back_populates='answer_options')
    quiz_questions = db.relationship('QuizQuestion', back_populates='correct_answer', foreign_keys='QuizQuestion.correct_answer_id')


# ----------------------------
# PageReads
# ----------------------------
class PageRead(db.Model):
    __tablename__ = 'page_reads'

    id = db.Column(db.BigInteger, primary_key=True)
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'), nullable=False)
    student_id = db.Column(db.BigInteger, db.ForeignKey('students.id'), nullable=False)
    created_at = db.Column(db.DateTime)

    student = db.relationship('Student', back_populates='page_reads')
    target = db.relationship('Target', back_populates='page_reads')


# ----------------------------
# SubmissionComments
# ----------------------------
class SubmissionComment(db.Model):
    __tablename__ = 'submission_comments'

    id = db.Column(db.BigInteger, primary_key=True)
    submission_id = db.Column(db.BigInteger, db.ForeignKey('timeline_events.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    hidden_by_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    comment = db.Column(db.Text)
    hidden_at = db.Column(db.DateTime)
    archived_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', foreign_keys=[user_id], back_populates='submission_comments')
    hidden_by = db.relationship('User', foreign_keys=[hidden_by_id])
    submission = db.relationship('TimelineEvent', back_populates='submission_comments')


# ----------------------------
# SubmissionReports
# ----------------------------
class SubmissionReport(db.Model):
    __tablename__ = 'submission_reports'

    id = db.Column(db.BigInteger, primary_key=True)
    submission_id = db.Column(db.BigInteger, db.ForeignKey('timeline_events.id'))
    reporter = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default='queued')
    conclusion = db.Column(db.String)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    report = db.Column(db.Text)
    target_url = db.Column(db.String)
    heading = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    submission = db.relationship('TimelineEvent', back_populates='submission_reports')


# ----------------------------
# Posts
# ----------------------------
class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.BigInteger, primary_key=True)
    topic_id = db.Column(db.BigInteger, db.ForeignKey('topics.id'))
    creator_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    editor_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    archiver_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    reply_to_post_id = db.Column(db.BigInteger, db.ForeignKey('posts.id'))
    post_number = db.Column(db.Integer, nullable=False)
    body = db.Column(db.Text)
    solution = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    edit_reason = db.Column(db.String)

    topic = db.relationship('Topic', back_populates='posts')
    creator = db.relationship('User', foreign_keys=[creator_id])
    editor = db.relationship('User', foreign_keys=[editor_id])
    archiver = db.relationship('User', foreign_keys=[archiver_id])
    replies = db.relationship('Post', back_populates='reply_to', remote_side=[id])
    reply_to = db.relationship('Post', back_populates='replies', remote_side=[reply_to_post_id])


# ----------------------------
# StartupFeedback
# ----------------------------
class StartupFeedback(db.Model):
    __tablename__ = 'startup_feedback'

    id = db.Column(db.Integer, primary_key=True)
    timeline_event_id = db.Column(db.Integer, db.ForeignKey('timeline_events.id'))
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'))
    feedback = db.Column(db.Text)
    reference_url = db.Column(db.String)
    activity_type = db.Column(db.String)
    attachment = db.Column(db.String)
    sent_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    faculty = db.relationship('Faculty', back_populates='startup_feedbacks')
    timeline_event = db.relationship('TimelineEvent', back_populates='startup_feedbacks')


# ----------------------------
# TimelineEventFiles
# ----------------------------
class TimelineEventFile(db.Model):
    __tablename__ = 'timeline_event_files'

    id = db.Column(db.Integer, primary_key=True)
    timeline_event_id = db.Column(db.Integer, db.ForeignKey('timeline_events.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    title = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    timeline_event = db.relationship('TimelineEvent', back_populates='files')
    user = db.relationship('User', back_populates='timeline_event_files')


# ----------------------------
# WebhookEndpoints
# ----------------------------
class WebhookEndpoint(db.Model):
    __tablename__ = 'webhook_endpoints'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'), nullable=False)
    webhook_url = db.Column(db.String, nullable=False)
    hmac_key = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, default=True)
    events = db.Column(db.JSON)
    
    course = db.relationship('Course', back_populates='webhook_endpoints')


# Relations complémentaires pour back_populates
User.submission_comments = db.relationship('SubmissionComment', back_populates='user')
User.issued_certificates = db.relationship('IssuedCertificate', back_populates='user')
TimelineEvent.submission_reports = db.relationship('SubmissionReport', back_populates='submission')
TimelineEvent.files = db.relationship('TimelineEventFile', back_populates='timeline_event')
Topic.posts = db.relationship('Post', back_populates='topic')
Faculty.startup_feedbacks = db.relationship('StartupFeedback', back_populates='faculty')

