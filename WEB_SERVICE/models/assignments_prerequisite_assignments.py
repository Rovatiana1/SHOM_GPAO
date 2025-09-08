from WEB_SERVICE.db import db

# ----------------------------
# Table: assignments_prerequisite_assignments
# ----------------------------
class AssignmentPrerequisiteAssignment(db.Model):
    __tablename__ = 'assignments_prerequisite_assignments'

    assignment_id = db.Column(db.BigInteger, db.ForeignKey('assignments.id'), primary_key=True, nullable=False)
    prerequisite_assignment_id = db.Column(db.BigInteger, db.ForeignKey('assignments.id'), primary_key=True, nullable=False)

    # Relations
    assignment = db.relationship('Assignment', foreign_keys=[assignment_id], back_populates='prerequisites')
    prerequisite_assignment = db.relationship('Assignment', foreign_keys=[prerequisite_assignment_id], back_populates='dependent_assignments')

