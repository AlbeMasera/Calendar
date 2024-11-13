# Calendar App Backend

This is the backend of the calendar application that manages user authentication, events, and data persistence. The backend is built using Python with Flask, uses JWT for secure authentication, and PostgreSQL for data storage.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
6. [Development](#development)
7. [License](#license)

---

## Features

- **User Authentication**: Register and login with JWT-based authentication, including CSRF protection.
- **Event Management**: Create, edit, delete, and share events.
- **User Search**: Search for users to share events with.
- **Role-Based Access Control**: Only event owners can edit or share events.
- **PostgreSQL Database**: Persistent data storage for user and event information.

## Tech Stack

- **Python** with **Flask**
- **Flask SQLAlchemy** for ORM
- **Flask Migrate** for database migrations
- **Flask JWT Extended** for authentication
- **PostgreSQL** for data storage

## Installation

1. **Set up a Virtual Environment** (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Database Migrations**:
   ```bash
   flask db upgrade
   ```

4. **Start the Server**:
   ```bash
   python app.py
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```plaintext
SECRET_KEY=your_flask_secret_key
DATABASE_URI=postgresql://user:password@db:5432/calendardb
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRES=3600  # Token expiration in seconds
JWT_COOKIE_SECURE=False  # Set True for production
JWT_COOKIE_HTTPONLY=True  # Prevent JavaScript access
JWT_COOKIE_CSRF_PROTECT=True  # Enable CSRF protection for JWT
```

## API Endpoints

### Authentication

- **`POST /auth/register`**: Register a new user.
  - **Request Body**: `{ "username": "string", "password": "string" }`
  - **Response**: `{"msg": "User created successfully"}`

- **`POST /auth/login`**: Login to obtain a JWT access token.
  - **Request Body**: `{ "username": "string", "password": "string" }`
  - **Response**: `{"msg": "Login successful", "username": "string"}` with JWT token set in cookies.

- **`POST /auth/logout`**: Logout and clear the JWT cookies.
  - **Response**: `{"msg": "Logout successful"}`

### Events

- **`GET /api/events`**: Retrieve events owned by or shared with the authenticated user.
  - **Response**: `{"events": [event_data]}`

- **`POST /api/events`**: Create a new event.
  - **Request Body**: `{ "title": "string", "description": "string", "start_time": "ISO8601", "end_time": "ISO8601", "shared_with": ["username"] }`
  - **Response**: `{"msg": "Event created successfully"}`

- **`PUT /api/events/<event_id>`**: Update an existing event (owner only).
  - **Request Body**: `{ "title": "string", "description": "string", "start_time": "ISO8601", "end_time": "ISO8601", "shared_with": ["username"] }`
  - **Response**: `{"msg": "Event updated successfully"}`

- **`POST /api/events/<event_id>/share`**: Share an event with another user (owner only).
  - **Request Body**: `{ "username": "string" }`
  - **Response**: `{"msg": "Event shared successfully"}`

### Users

- **`GET /api/users?q=<query>`**: Search for users by username.
  - **Query Parameter**: `q=<username>`
  - **Response**: `{"users": ["username1", "username2", ...]}`

## Development

### Running Migrations

If you make changes to the database models, you can update the database schema with:

```bash
flask db migrate -m "Migration message"
flask db upgrade
```

### API Authorization

- **JWT Authentication**: JWT tokens are stored in cookies and are protected with CSRF tokens.
- **Route Protection**: Routes are protected using the `@jwt_required()` decorator, which checks for valid authentication.

