from flask import Blueprint, request, jsonify
from .models import User, Event
from . import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

auth_bp = Blueprint("auth", __name__)
event_bp = Blueprint("event", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401


@event_bp.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    user_id = get_jwt_identity()
    events = Event.query.filter_by(owner_id=user_id).all()
    events_data = [
        {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time.isoformat(),
            "end_time": event.end_time.isoformat(),
        }
        for event in events
    ]
    return jsonify(events=events_data), 200


@event_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    data = request.get_json()
    new_event = Event(
        title=data.get("title"),
        description=data.get("description"),
        start_time=datetime.fromisoformat(data.get("start_time")),
        end_time=datetime.fromisoformat(data.get("end_time")),
        owner_id=user_id,
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"msg": "Event created successfully"}), 201


@event_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    if event.owner_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403

    data = request.get_json()
    event.title = data.get("title")
    event.description = data.get("description")
    event.start_time = datetime.fromisoformat(data.get("start_time"))
    event.end_time = datetime.fromisoformat(data.get("end_time"))
    db.session.commit()
    return jsonify({"msg": "Event updated successfully"}), 200


@event_bp.route("/events/<int:event_id>/share", methods=["POST"])
@jwt_required()
def share_event(event_id):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    if event.owner_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403

    data = request.get_json()
    username_to_share = data.get("username")
    user_to_share = User.query.filter_by(username=username_to_share).first()
    if user_to_share:
        event.shared_with.append(user_to_share)
        db.session.commit()
        return jsonify({"msg": "Event shared successfully"}), 200
    else:
        return jsonify({"msg": "User not found"}), 404
