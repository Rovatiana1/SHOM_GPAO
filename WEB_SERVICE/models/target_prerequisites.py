from WEB_SERVICE.db import db

# ----------------------------
# Table: target_prerequisites
# ----------------------------
class TargetPrerequisite(db.Model):
    __tablename__ = 'target_prerequisites'

    id = db.Column(db.Integer, primary_key=True)
    target_id = db.Column(db.Integer, db.ForeignKey('targets.id'))
    prerequisite_target_id = db.Column(db.Integer, db.ForeignKey('targets.id'))

    # Relations
    target = db.relationship('Target', foreign_keys=[target_id], back_populates='prerequisites')
    prerequisite_target = db.relationship('Target', foreign_keys=[prerequisite_target_id], back_populates='required_for')
