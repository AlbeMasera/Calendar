import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "default_secure_key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URI",
        "postgresql://pzvhnbouqvwfcitclhmh:wdkzulrqrwgfywqhbzro@db:5432/calendardb",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_jwt_secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_COOKIE_SECURE = False  # Use True in production with HTTPS
    JWT_COOKIE_HTTPONLY = True  # Prevent JavaScript access to the access token cookie
    JWT_COOKIE_CSRF_PROTECT = True  # Enable CSRF protection
    JWT_CSRF_METHODS = ["POST", "PUT", "PATCH", "DELETE"]
    JWT_TOKEN_LOCATION = ["cookies"]
    CORS_SUPPORTS_CREDENTIALS = True
