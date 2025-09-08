from WEB_SERVICE.db import db

# ----------------------------
# Table: evaluation_criteria
# ----------------------------
class EvaluationCriteria(db.Model):
    __tablename__ = 'evaluation_criteria'

    id = db.Column(db.BigInteger, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'))
    max_grade = db.Column(db.Integer)
    grade_labels = db.Column(db.JSON)

    # Relations
    course = db.relationship('Course', back_populates='evaluation_criteria')
    targets = db.relationship('TargetEvaluationCriterion', back_populates='evaluation_criterion')
    assignment_links = db.relationship(
        'AssignmentEvaluationCriterion',
        back_populates='evaluation_criterion',
        cascade='all, delete-orphan'
    )