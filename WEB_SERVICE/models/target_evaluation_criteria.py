from WEB_SERVICE.db import db

# ----------------------------
# Table: target_evaluation_criteria
# ----------------------------
class TargetEvaluationCriterion(db.Model):
    __tablename__ = 'target_evaluation_criteria'

    id = db.Column(db.BigInteger, primary_key=True)
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'))
    evaluation_criterion_id = db.Column(db.BigInteger, db.ForeignKey('evaluation_criteria.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    target = db.relationship('Target', back_populates='evaluation_criteria')
    evaluation_criterion = db.relationship('EvaluationCriterion', back_populates='targets')
