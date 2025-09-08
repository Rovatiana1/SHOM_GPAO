from WEB_SERVICE.db import db

# ----------------------------
# Table: topic_categories
# ----------------------------
class TopicCategory(db.Model):
    __tablename__ = 'topic_categories'

    id = db.Column(db.BigInteger, primary_key=True)
    community_id = db.Column(db.BigInteger, db.ForeignKey('communities.id'), nullable=False)
    name = db.Column(db.String, nullable=False)

    # Relations
    community = db.relationship('Community', back_populates='topic_categories')
    topics = db.relationship('Topic', back_populates='category')
