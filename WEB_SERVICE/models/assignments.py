from WEB_SERVICE.db import db

# ----------------------------
# Table: assignments
# ----------------------------
class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.BigInteger, primary_key=True)
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'), nullable=False)
    role = db.Column(db.String)
    checklist = db.Column(db.JSON)
    completion_instructions = db.Column(db.String)
    milestone = db.Column(db.Boolean, default=False, nullable=False)
    milestone_number = db.Column(db.Integer)
    archived = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    discussion = db.Column(db.Boolean, default=False)
    allow_anonymous = db.Column(db.Boolean, default=False)

    # Relations
    target = db.relationship('Target', back_populates='assignments')
    quizzes = db.relationship('Quiz', back_populates='assignment')
    evaluation_criteria_links = db.relationship(
        'AssignmentEvaluationCriterion',
        back_populates='assignment',
        cascade='all, delete-orphan'
    )
    prerequisites = db.relationship(
        'AssignmentPrerequisiteAssignment',
        foreign_keys='AssignmentPrerequisiteAssignment.assignment_id',
        back_populates='assignment',
        cascade='all, delete-orphan'
    )
    dependent_assignments = db.relationship(
        'AssignmentPrerequisiteAssignment',
        foreign_keys='AssignmentPrerequisiteAssignment.prerequisite_assignment_id',
        back_populates='prerequisite_assignment',
        cascade='all, delete-orphan'
    )
