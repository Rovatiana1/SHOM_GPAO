from WEB_SERVICE.db import db

# ----------------------------
# Table: page_reads
# ----------------------------
class PageRead(db.Model):
    __tablename__ = 'page_reads'

    id = db.Column(db.BigInteger, primary_key=True)
    target_id = db.Column(db.BigInteger, nullable=False)
    student_id = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime)

    # Relation
    student = db.relationship('Student', back_populates='page_reads')
    target = db.relationship('Target', back_populates='page_reads')