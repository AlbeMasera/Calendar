#!/bin/bash

# Define variables
DB_CONTAINER="db"
DB_USER="user"
DB_NAME="calendardb"

# Command to truncate tables and reset IDs
TRUNCATE_COMMAND="TRUNCATE TABLE users, events, event_user RESTART IDENTITY CASCADE;"

echo "Clearing all data in the PostgreSQL database '$DB_NAME' in container '$DB_CONTAINER'..."

# Run the command inside the Docker container
docker-compose exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "$TRUNCATE_COMMAND"

echo "Database contents cleared successfully."