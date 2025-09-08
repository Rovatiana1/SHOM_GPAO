from WEB_SERVICE.db import db

# ----------------------------
# Table: answer_options
# ----------------------------
class AnswerOption(db.Model):
    __tablename__ = 'answer_options'

    id = db.Column(db.BigInteger, primary_key=True)
    quiz_question_id = db.Column(db.BigInteger)
    value = db.Column(db.Text)
    hint = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relation
    quiz_question = db.relationship('QuizQuestion', back_populates='answer_options')
    quiz_questions = db.relationship('QuizQuestion', back_populates='correct_answer', foreign_keys='QuizQuestion.correct_answer_id')
