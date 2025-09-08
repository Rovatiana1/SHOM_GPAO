from WEB_SERVICE.db import db

# ----------------------------
# Table: taggings
# ----------------------------
class Tagging(db.Model):
    __tablename__ = 'taggings'

    id = db.Column(db.Integer, primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'))
    taggable_id = db.Column(db.Integer)
    taggable_type = db.Column(db.String)
    tagger_id = db.Column(db.Integer)
    tagger_type = db.Column(db.String)
    context = db.Column(db.String(128))
    created_at = db.Column(db.DateTime)

    # Relations
    tag = db.relationship('Tag', back_populates='taggings')
