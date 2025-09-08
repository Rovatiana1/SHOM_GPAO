from WEB_SERVICE.db import db

# ----------------------------
# Table: quizzes
# ----------------------------
class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String)
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'))
    assignment_id = db.Column(db.BigInteger, db.ForeignKey('assignments.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    target = db.relationship('Target', back_populates='quizzes')
    assignment = db.relationship('Assignment', back_populates='quizzes')

