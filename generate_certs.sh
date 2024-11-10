#!/bin/bash

# Create directories for certificates and private keys
mkdir -p certs private

# Generate a self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout private/key.pem \
    -out certs/cert.pem \
    -subj "/CN=localhost"