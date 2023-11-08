#!/bin/bash

echo "Collecting static files"
python manage.py collectstatic --noinput

echo "Apply database migrations"
# python3 manage.py migrate
# python3 manage.py makemigrations

exec "$@"

