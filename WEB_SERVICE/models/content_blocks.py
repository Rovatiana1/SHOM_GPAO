from WEB_SERVICE.db import db

# ----------------------------
# Table: content_blocks
# ----------------------------
class ContentBlock(db.Model):
    __tablename__ = 'content_blocks'

    id = db.Column(db.BigInteger, primary_key=True)
    block_type = db.Column(db.String)
    content = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    sort_index = db.Column(db.Integer, nullable=False, default=0)
    target_version_id = db.Column(db.BigInteger, db.ForeignKey('versions.id'))

    # Relations
    target_version = db.relationship('Version', back_populates='content_blocks')
