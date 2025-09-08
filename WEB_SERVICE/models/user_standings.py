from WEB_SERVICE.db import db

# ----------------------------
# Table: user_standings
# ----------------------------
class UserStanding(db.Model):
    __tablename__ = 'user_standings'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    standing_id = db.Column(db.BigInteger, db.ForeignKey('standings.id'), nullable=False)
    reason = db.Column(db.Text)
    creator_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    archiver_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    archived_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    # Relations
    user = db.relationship('User', foreign_keys=[user_id], back_populates='user_standings')
    creator = db.relationship('User', foreign_keys=[creator_id])
    archiver = db.relationship('User', foreign_keys=[archiver_id])
    standing = db.relationship('Standing', back_populates='user_standings')


