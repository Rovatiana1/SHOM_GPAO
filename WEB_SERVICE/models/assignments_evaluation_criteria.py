from WEB_SERVICE.db import db

# ----------------------------
# Table: assignments_evaluation_criteria
# ----------------------------
class AssignmentEvaluationCriterion(db.Model):
    __tablename__ = 'assignments_evaluation_criteria'

    assignment_id = db.Column(db.BigInteger, db.ForeignKey('assignments.id'), primary_key=True, nullable=False)
    evaluation_criterion_id = db.Column(db.BigInteger, db.ForeignKey('evaluation_criteria.id'), primary_key=True, nullable=False)

    # Relations
    assignment = db.relationship('Assignment', back_populates='evaluation_criteria_links')
    evaluation_criterion = db.relationship('EvaluationCriterion', back_populates='assignment_links')
