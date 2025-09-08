from WEB_SERVICE.db import db

# ----------------------------
# Table: community_course_connections
# ----------------------------
class CommunityCourseConnection(db.Model):
    __tablename__ = 'community_course_connections'

    id = db.Column(db.BigInteger, primary_key=True)
    community_id = db.Column(db.BigInteger)
    course_id = db.Column(db.BigInteger)

    # Relations
    course = db.relationship('Course', back_populates='community_connections')
    community = db.relationship('Community', back_populates='course_connections')

