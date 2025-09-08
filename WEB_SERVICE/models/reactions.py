from WEB_SERVICE.db import db

# ----------------------------
# Table: reactions
# ----------------------------
class Reaction(db.Model):
    __tablename__ = 'reactions'

    id = db.Column(db.BigInteger, primary_key=True)
    reaction_value = db.Column(db.String)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    reactionable_type = db.Column(db.String, nullable=False)
    reactionable_id = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', back_populates='reactions')
