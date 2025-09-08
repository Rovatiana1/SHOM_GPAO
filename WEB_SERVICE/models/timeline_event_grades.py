from WEB_SERVICE.db import db

# ----------------------------
# Table: timeline_event_grades
# ----------------------------
class TimelineEventGrade(db.Model):
    __tablename__ = 'timeline_event_grades'

    id = db.Column(db.BigInteger, primary_key=True)
    timeline_event_id = db.Column(db.BigInteger, db.ForeignKey('timeline_events.id'))
    evaluation_criterion_id = db.Column(db.BigInteger, db.ForeignKey('evaluation_criteria.id'))
    grade = db.Column(db.Integer)

    # Relations
    timeline_event = db.relationship('TimelineEvent', back_populates='grades')
    evaluation_criterion = db.relationship('EvaluationCriteria', back_populates='timeline_grades')


