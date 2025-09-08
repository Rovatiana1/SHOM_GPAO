from WEB_SERVICE.db import db

class StorageLogModel(db.Model):
    __tablename__ = 'storage_log'

    id = db.Column(db.BigInteger, primary_key=True)
    filename = db.Column(db.String, nullable=True)
    action_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    level = db.Column(db.String(10), nullable=False)
    source_ip = db.Column(db.String, nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    trace = db.Column(db.Text, nullable=True)
    checksum_md5 = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    archived_at = db.Column(db.DateTime, nullable=True)
