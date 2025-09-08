from WEB_SERVICE.db import db

# ----------------------------
# Table: tags
# ----------------------------
class Tag(db.Model):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    taggings_count = db.Column(db.Integer, default=0)

    # Relations
    taggings = db.relationship('Tagging', back_populates='tag')

