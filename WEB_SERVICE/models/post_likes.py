from WEB_SERVICE.db import db

# ----------------------------
# Table: post_likes
# ----------------------------
class PostLike(db.Model):
    __tablename__ = 'post_likes'

    id = db.Column(db.BigInteger, primary_key=True)
    post_id = db.Column(db.BigInteger, db.ForeignKey('posts.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    post = db.relationship('Post', back_populates='likes')
    user = db.relationship('User', back_populates='post_likes')

