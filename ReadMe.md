# Calendar App

A hopefully secure calendar application that allows users to manage schedules


## Tech Stack

### Frontend
- **Svelte** with **Svelte Routing**
- **Rollup** for bundling

### Backend
- **Python** with Flask
- **PostgreSQL** for data management

### Reverse Proxy
- **NGINX** for HTTPS and routing

### Docker
- **Docker Compose** to manage multi-container services

## Quick Start

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AlbeMasera/calendar-app.git
   cd calendar-app
   ```

2. **Run the Build Script**:
   Simply execute the provided `build.sh` script, which will:
   - Generate self-signed certificates for HTTPS
   - Build and start all required services with Docker Compose.

   ```bash
   chmod +x build.sh
   ./build.sh
   ```

3. **Access the Application**:
   Open your browser and go to:
   ```plaintext
   https://localhost/
   ```

## Project Structure

```plaintext
calendar-app/
├── backend/                # Python backend application
├── frontend/               # Svelte frontend application
├── nginx/                  # NGINX configuration for reverse proxy
├── certs/                  # SSL certificates for HTTPS
├── private/                # Private keys for SSL certificates
├── build.sh                # Script to build and start the application
├── clear_database.sh       # Script to clean the database
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## Environment Variables

Set up if not already present the following variables in `backend/.env` (the `build.sh` script will ensure they're used):

```plaintext
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=calendardb
JWT_SECRET=your_jwt_secret
CSRF_SECRET=your_csrf_secret
```


