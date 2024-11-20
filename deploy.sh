#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display messages
function echo_info {
    echo -e "\e[32m[INFO]\e[0m $1"
}

function echo_error {
    echo -e "\e[31m[ERROR]\e[0m $1"
}

# Generate self-signed certificates
echo_info "Generating self-signed certificates..."
./generate_certs.sh

# Navigate to the frontend directory
echo_info "Navigating to the frontend directory..."
cd frontend

# Install frontend dependencies
echo_info "Installing frontend dependencies with npm install..."
npm install

# Navigate back to the project root directory
echo_info "Returning to the project root directory..."
cd ..

# Build and run the services
docker-compose up --build