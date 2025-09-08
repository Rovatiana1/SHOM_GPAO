from WEB_SERVICE.db import db

# ----------------------------
# Table: posts
# ----------------------------
class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.BigInteger, primary_key=True)
    topic_id = db.Column(db.BigInteger, db.ForeignKey('topics.id'))
    creator_id = db.Column(db.BigInteger)
    editor_id = db.Column(db.BigInteger)
    archiver_id = db.Column(db.BigInteger)
    archived_at = db.Column(db.DateTime)
    reply_to_post_id = db.Column(db.BigInteger, db.ForeignKey('posts.id'))
    post_number = db.Column(db.Integer, nullable=False)
    body = db.Column(db.Text)
    solution = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    edit_reason = db.Column(db.String)

    # Relations
    topic = db.relationship('Topic', back_populates='posts')
    creator = db.relationship('User', foreign_keys=[creator_id])
    editor = db.relationship('User', foreign_keys=[editor_id])
    archiver = db.relationship('User', foreign_keys=[archiver_id])
    replies = db.relationship('Post', back_populates='reply_to', remote_side=[id])
    reply_to = db.relationship('Post', back_populates='replies', remote_side=[reply_to_post_id])


