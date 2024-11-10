#!/bin/bash

# Generate self-signed certificates
./generate_certs.sh

# Build and run the services
docker-compose up --build