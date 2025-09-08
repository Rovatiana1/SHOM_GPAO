from WEB_SERVICE.db import db

# ----------------------------
# Table: course_authors
# ----------------------------
class CourseAuthor(db.Model):
    __tablename__ = 'course_authors'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger)
    course_id = db.Column(db.BigInteger)
    exited = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='course_authorships')
    course = db.relationship('Course', back_populates='authors')
