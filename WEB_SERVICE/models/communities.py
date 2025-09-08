from WEB_SERVICE.db import db

# ----------------------------
# Table: communities
# ----------------------------
class Community(db.Model):
    __tablename__ = 'communities'

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String)
    target_linkable = db.Column(db.Boolean, default=False)
    school_id = db.Column(db.BigInteger, db.ForeignKey('schools.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    discord_channel_id = db.Column(db.String)

    # Relations
    school = db.relationship('School', back_populates='communities')
    topic_categories = db.relationship('TopicCategory', back_populates='community')

