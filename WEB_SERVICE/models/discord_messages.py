from WEB_SERVICE.db import db

# ----------------------------
# Table: discord_messages
# ----------------------------
class DiscordMessage(db.Model):
    __tablename__ = 'discord_messages'

    id = db.Column(db.BigInteger, primary_key=True)
    author_uuid = db.Column(db.String, nullable=False)
    channel_uuid = db.Column(db.String)
    message_uuid = db.Column(db.String, nullable=False)
    server_uuid = db.Column(db.String, nullable=False)
    content = db.Column(db.String)
    timestamp = db.Column(db.DateTime)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='discord_messages')


