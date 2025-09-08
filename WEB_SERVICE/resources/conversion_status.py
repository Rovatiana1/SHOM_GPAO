from flask_restful import Resource
from WEB_SERVICE.models.conversion_jobs import ConversionJobModel

class ConversionStatus(Resource):
    def get(self, job_id):
        job = ConversionJobModel.query.filter_by(job_id=job_id).first()
        if not job:
            return {"error": "Job not found"}, 404
        return job.as_dict(), 200
    
class ConversionJobList(Resource):
    def get(self):        
        # Trie par created_at en ordre décroissant
        jobs = ConversionJobModel.query.order_by(ConversionJobModel.created_at.desc()).all()
        return [job.as_dict() for job in jobs], 200
