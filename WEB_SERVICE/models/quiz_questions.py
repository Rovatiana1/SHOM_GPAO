from WEB_SERVICE.db import db

# ----------------------------
# Table: quiz_questions
# ----------------------------
class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    id = db.Column(db.BigInteger, primary_key=True)
    question = db.Column(db.Text)
    description = db.Column(db.Text)
    quiz_id = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    correct_answer_id = db.Column(db.BigInteger)

    # Relation
    correct_answer = db.relationship('AnswerOption', back_populates='quiz_questions', foreign_keys=[correct_answer_id])
    answer_options = db.relationship('AnswerOption', back_populates='quiz_question', foreign_keys='AnswerOption.quiz_question_id')
    quiz = db.relationship('Quiz', back_populates='questions')