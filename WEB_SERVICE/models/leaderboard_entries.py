from WEB_SERVICE.db import db

# ----------------------------
# Table: leaderboard_entries
# ----------------------------
class LeaderboardEntry(db.Model):
    __tablename__ = 'leaderboard_entries'

    id = db.Column(db.BigInteger, primary_key=True)
    period_from = db.Column(db.DateTime, nullable=False)
    period_to = db.Column(db.DateTime, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    student_id = db.Column(db.BigInteger)

    # Relations
    student = db.relationship('Student', back_populates='leaderboard_entries')