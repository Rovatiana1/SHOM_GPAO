from WEB_SERVICE.db import db

# ----------------------------
# Table: topic_subscriptions
# ----------------------------
class TopicSubscription(db.Model):
    __tablename__ = 'topic_subscriptions'

    id = db.Column(db.BigInteger, primary_key=True)
    topic_id = db.Column(db.BigInteger, db.ForeignKey('topics.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    topic = db.relationship('Topic', back_populates='subscriptions')
    user = db.relationship('User', back_populates='topic_subscriptions')

