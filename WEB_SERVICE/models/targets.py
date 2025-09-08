from WEB_SERVICE.db import db

# ----------------------------
# Table: Target
# ----------------------------
class Target(db.Model):
    __tablename__ = 'targets'

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String)
    title = db.Column(db.String)
    description = db.Column(db.Text)
    completion_instructions = db.Column(db.String)
    resource_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    slideshow_embed = db.Column(db.Text)
    days_to_complete = db.Column(db.Integer)
    target_action_type = db.Column(db.String)
    target_group_id = db.Column(db.Integer, db.ForeignKey('target_groups.id'))
    sort_index = db.Column(db.Integer, default=999)
    session_at = db.Column(db.DateTime)
    video_embed = db.Column(db.Text)
    last_session_at = db.Column(db.DateTime)
    link_to_complete = db.Column(db.String)
    archived = db.Column(db.Boolean, default=False)
    youtube_video_id = db.Column(db.String)
    feedback_asked_at = db.Column(db.DateTime)
    call_to_action = db.Column(db.String)
    rubric_description = db.Column(db.Text)
    resubmittable = db.Column(db.Boolean, default=True)
    visibility = db.Column(db.String)
    review_checklist = db.Column(db.JSON, default=[])
    checklist = db.Column(db.JSON, default=[])
    action_config = db.Column(db.Text)
    milestone = db.Column(db.Boolean, default=False)
    milestone_number = db.Column(db.Integer)

    # Relations
    target_group = db.relationship('TargetGroup', back_populates='targets')
    prerequisites = db.relationship('TargetPrerequisite', foreign_keys='TargetPrerequisite.target_id', back_populates='target')
    required_for = db.relationship('TargetPrerequisite', foreign_keys='TargetPrerequisite.prerequisite_target_id', back_populates='prerequisite_target')    
    evaluation_criteria = db.relationship('TargetEvaluationCriterion', back_populates='target')
    versions = db.relationship('TargetVersion', back_populates='target')
    timeline_events = db.relationship('TimelineEvent', back_populates='target')
    topics = db.relationship('Topic', back_populates='target')