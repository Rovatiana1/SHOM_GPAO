from WEB_SERVICE.extensions import socketio
from flask_socketio import join_room, leave_room, emit

# @socketio.on('subscribe_to_job')
# def handle_subscribe_to_job(data):
#     """Permet à un client de s'abonner aux mises à jour d'un job spécifique"""
#     job_id = data.get('job_id')
#     if job_id:
#         join_room(f"job_{job_id}")
#         emit('subscription_confirmation', {'job_id': job_id, 'status': 'subscribed'})

# @socketio.on('unsubscribe_from_job')
# def handle_unsubscribe_from_job(data):
#     """Permet à un client de se désabonner des mises à jour"""
#     job_id = data.get('job_id')
#     if job_id:
#         leave_room(f"job_{job_id}")
        
@socketio.on('subscribe_to_job')
def handle_subscribe_to_job(data):
    job_id = data.get('job_id')
    if job_id:
        room_name = f"job_{job_id}"
        join_room(room_name)
        print(f"Client joined room {room_name}")
        
@socketio.on('connect')
def handle_connect():
    print('Client connected')