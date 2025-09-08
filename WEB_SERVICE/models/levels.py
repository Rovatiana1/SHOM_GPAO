from WEB_SERVICE.db import db

# ----------------------------
# Table: levels
# ----------------------------
class Level(db.Model):
    __tablename__ = 'levels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    number = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    unlock_at = db.Column(db.DateTime)
    course_id = db.Column(db.BigInteger)

    # Relations
    course = db.relationship('Course', back_populates='levels')
    target_groups = db.relationship('TargetGroup', back_populates='level')