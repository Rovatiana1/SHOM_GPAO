from WEB_SERVICE.db import db

# ----------------------------
# Table: delayed_jobs
# ----------------------------
class DelayedJob(db.Model):
    __tablename__ = 'delayed_jobs'

    id = db.Column(db.Integer, primary_key=True)
    priority = db.Column(db.Integer, nullable=False, default=0)
    attempts = db.Column(db.Integer, nullable=False, default=0)
    handler = db.Column(db.Text, nullable=False)
    last_error = db.Column(db.Text)
    run_at = db.Column(db.DateTime)
    locked_at = db.Column(db.DateTime)
    failed_at = db.Column(db.DateTime)
    locked_by = db.Column(db.String)
    queue = db.Column(db.String)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)
