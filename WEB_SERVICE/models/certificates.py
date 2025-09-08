from WEB_SERVICE.db import db

# ----------------------------
# Table: certificates
# ----------------------------
class Certificate(db.Model):
    __tablename__ = 'certificates'

    id = db.Column(db.BigInteger, primary_key=True)
    course_id = db.Column(db.BigInteger, db.ForeignKey('courses.id'), nullable=False)
    qr_corner = db.Column(db.String, nullable=False)
    qr_scale = db.Column(db.Integer, nullable=False)
    name_offset_top = db.Column(db.Integer, nullable=False)
    font_size = db.Column(db.Integer, nullable=False)
    margin = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=False, nullable=False)
    name = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relation
    course = db.relationship('Course', back_populates='certificates')

