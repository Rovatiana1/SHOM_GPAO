from WEB_SERVICE.db import db

# ----------------------------
# Table: coach_notes
# ----------------------------
class CoachNote(db.Model):
    __tablename__ = 'coach_notes'

    id = db.Column(db.BigInteger, primary_key=True)
    author_id = db.Column(db.BigInteger, db.ForeignKey('faculty.id'))
    student_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    archived_at = db.Column(db.DateTime)

    # Relations
    author = db.relationship('Faculty', back_populates='coach_notes')
    student = db.relationship('User', back_populates='notes')
