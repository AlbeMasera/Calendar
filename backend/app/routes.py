from flask import Blueprint, request, jsonify, current_app
from .models import User, Event
from . import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import re
from markupsafe import escape
from flask_jwt_extended import (
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
    get_csrf_token,
)


auth_bp = Blueprint("auth", __name__)
event_bp = Blueprint("event", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = escape(data.get("username", "").strip())
    password = escape(data.get("password", ""))

    # Backend validation
    if not re.match(r"^[a-zA-Z0-9_]{3,20}$", username):
        return jsonify({"msg": "Invalid username format"}), 400

    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters long"}), 400

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
        response = jsonify({"msg": "Login successful", "username": username})
        set_access_cookies(response, access_token)
        response.set_cookie(
            "csrf_access_token",
            get_csrf_token(access_token),
            secure=False,  # Use True in production
            httponly=False,  # Must be False so JavaScript can access it
            samesite="Lax",  # Adjust as needed
        )

        return response, 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401


@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200


@event_bp.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    current_app.logger.info("Entered get_events route")

    user_id = get_jwt_identity()
    current_app.logger.info(f"User ID from token: {user_id}")

    user = User.query.get(user_id)

    # Events owned by the user
    owned_events = Event.query.filter_by(owner_id=user_id)

    # Events shared with the user
    shared_events = user.shared_events

    all_events = owned_events.union(shared_events).all()

    events_data = []
    for event in all_events:
        events_data.append(
            {
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "start_time": event.start_time.isoformat(),
                "end_time": event.end_time.isoformat(),
                "owner": event.owner.username,
                "shared_with": [user.username for user in event.shared_with],
            }
        )

    return jsonify({"events": events_data}), 200


@event_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    data = request.get_json()
    title = escape(data.get("title"))
    description = escape(data.get("description"))
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    shared_usernames = data.get(
        "shared_with", []
    )  # Default to empty list if not provided

    user_id = get_jwt_identity()
    event = Event(
        title=title,
        description=description,
        start_time=start_time,
        end_time=end_time,
        owner_id=user_id,
    )

    # Validate shared_usernames
    if shared_usernames:
        # Fetch users with the provided usernames
        shared_users = User.query.filter(User.username.in_(shared_usernames)).all()
        existing_usernames = [user.username for user in shared_users]
        # Identify any invalid usernames
        invalid_usernames = set(shared_usernames) - set(existing_usernames)
        if invalid_usernames:
            return (
                jsonify({"msg": f'User(s) not found: {", ".join(invalid_usernames)}'}),
                400,
            )
        # Associate valid users with the event
        event.shared_with.extend(shared_users)

    db.session.add(event)
    db.session.commit()

    return jsonify({"msg": "Event created successfully"}), 201


@event_bp.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
# @limiter.limit("30 per day")
def delete_event(event_id):

    user_id = get_jwt_identity()
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"msg": "Event not found"}), 404

    if event.owner_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({"msg": "Event deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting event: {e}")
        db.session.rollback()
        return jsonify({"msg": "An error occurred while deleting the event"}), 500


@event_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    data = request.get_json()
    title = escape(data.get("title"))
    description = escape(data.get("description"))
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    shared_usernames = data.get("shared_with", [])  # List of usernames

    user_id = get_jwt_identity()
    event = Event.query.filter_by(id=event_id, owner_id=user_id).first()
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    event.title = title
    event.description = description
    event.start_time = start_time
    event.end_time = end_time

    shared_usernames = data.get("shared_with", None)
    if shared_usernames is not None:
        if shared_usernames:
            shared_users = User.query.filter(User.username.in_(shared_usernames)).all()
            existing_usernames = [user.username for user in shared_users]
            invalid_usernames = set(shared_usernames) - set(existing_usernames)
            if invalid_usernames:
                return (
                    jsonify(
                        {"msg": f'User(s) not found: {", ".join(invalid_usernames)}'}
                    ),
                    400,
                )
            event.shared_with = shared_users
        else:
            # Clear shared users if an empty list is provided
            event.shared_with = []

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


@event_bp.route("/users", methods=["GET"])
@jwt_required()
def search_users():
    query = request.args.get("q", "")
    users = User.query.filter(User.username.ilike(f"%{query}%")).all()
    user_list = [user.username for user in users]
    return jsonify({"users": user_list}), 200
