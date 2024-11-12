from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from .routes import auth_bp, event_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(event_bp, url_prefix="/api")

    return app
