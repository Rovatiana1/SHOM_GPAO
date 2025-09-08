from WEB_SERVICE.db import db

# ----------------------------
# Table: target_groups
# ----------------------------
class TargetGroup(db.Model):
    __tablename__ = 'target_groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    sort_index = db.Column(db.Integer)
    milestone = db.Column(db.Boolean)
    level_id = db.Column(db.Integer)
    archived = db.Column(db.Boolean, default=False)

    # Relations
    level = db.relationship('Level', back_populates='target_groups')
    targets = db.relationship('Target', back_populates='target_group')