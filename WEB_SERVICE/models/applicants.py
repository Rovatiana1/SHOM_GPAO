from WEB_SERVICE.db import db

# ----------------------------
# Table: applicants
# ----------------------------
class Applicant(db.Model):
    __tablename__ = 'applicants'

    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.CITEXT)
    name = db.Column(db.String)
    login_token = db.Column(db.String)
    login_mail_sent_at = db.Column(db.DateTime)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    email_verified = db.Column(db.Boolean, default=False)
    login_token_digest = db.Column(db.String)

    # Relation
    course = db.relationship('Course', back_populates='applicants')


