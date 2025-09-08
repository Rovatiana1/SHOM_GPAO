from WEB_SERVICE.db import db

# ----------------------------
# Table: users
# ----------------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String)  # citext en Postgres
    login_token = db.Column(db.String)
    remember_created_at = db.Column(db.DateTime)
    sign_in_count = db.Column(db.Integer, default=0)
    current_sign_in_at = db.Column(db.DateTime)
    last_sign_in_at = db.Column(db.DateTime)
    current_sign_in_ip = db.Column(db.String)
    last_sign_in_ip = db.Column(db.String)
    encrypted_password = db.Column(db.String, nullable=False, default='')
    remember_token = db.Column(db.String)
    sign_out_at_next_request = db.Column(db.Boolean)
    confirmed_at = db.Column(db.DateTime)
    login_token_generated_at = db.Column(db.DateTime)
    name = db.Column(db.String)
    title = db.Column(db.String)
    about = db.Column(db.Text)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'))
    preferences = db.Column(db.JSON, nullable=False, default={"daily_digest": True})
    reset_password_token = db.Column(db.String)
    reset_password_sent_at = db.Column(db.DateTime)
    affiliation = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    time_zone = db.Column(db.String, nullable=False, default='Asia/Kolkata')
    organisation_id = db.Column(db.BigInteger, db.ForeignKey('organisations.id'))
    discord_user_id = db.Column(db.String)
    discord_tag = db.Column(db.String)
    # ... autres colonnes omises pour simplification

    # Relations
    organisation = db.relationship('Organisation', back_populates='users')
    school = db.relationship('School', back_populates='users')
    admin_user = db.relationship('AdminUser', back_populates='user', uselist=False)
    discord_messages = db.relationship('DiscordMessage', back_populates='user')
    markdown_attachments = db.relationship('MarkdownAttachment', back_populates='user')
    moderation_reports = db.relationship('ModerationReport', back_populates='user')
    reactions = db.relationship('Reaction', back_populates='user')
    organisation_admins = db.relationship('OrganisationAdmin', back_populates='user')
    school_admin = db.relationship('SchoolAdmin', back_populates='user')
    timeline_events_hidden = db.relationship('TimelineEvent', back_populates='hidden_by')
    timeline_events_reviewed = db.relationship('TimelineEvent', back_populates='reviewer')
    timeline_events_evaluated = db.relationship('TimelineEvent', back_populates='evaluator')
    locked_topics = db.relationship('Topic', back_populates='locked_by')
    user_standings = db.relationship('UserStanding', back_populates='user')
    submission_comments = db.relationship('SubmissionComment', back_populates='user')
    issued_certificates = db.relationship('IssuedCertificate', back_populates='user')
    