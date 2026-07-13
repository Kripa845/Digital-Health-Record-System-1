#!/usr/bin/env bash
# exit on error
set -o errexit

# Install packages
pip install -r requirements.txt

# Convert static assets
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate
