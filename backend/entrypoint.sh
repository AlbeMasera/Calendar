#!/bin/sh
export FLASK_APP=app
flask db upgrade
exec "$@"