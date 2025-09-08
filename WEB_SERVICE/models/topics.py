from WEB_SERVICE.db import db

# ----------------------------
# Table: Topic
# ----------------------------
class Topic(db.Model):
    __tablename__ = 'topics'

    id = db.Column(db.BigInteger, primary_key=True)
    community_id = db.Column(db.BigInteger, db.ForeignKey('communities.id'))
    target_id = db.Column(db.BigInteger, db.ForeignKey('targets.id'))
    last_activity_at = db.Column(db.DateTime)
    archived = db.Column(db.Boolean, default=False)
    title = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    views = db.Column(db.Integer, default=0)
    topic_category_id = db.Column(db.BigInteger, db.ForeignKey('topic_categories.id'))
    locked_at = db.Column(db.DateTime)
    locked_by_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))

    # Relations
    locked_by = db.relationship('User', back_populates='locked_topics')
    community = db.relationship('Community', back_populates='topics')
    target = db.relationship('Target', back_populates='topics')
    topic_category = db.relationship('TopicCategory', back_populates='topics')
    posts = db.relationship('Post', back_populates='topic')