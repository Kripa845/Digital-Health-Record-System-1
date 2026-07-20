"""
One-time script to obtain a Google OAuth2 refresh token for the Gmail API.

Setup:
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable the Gmail API:
   - APIs & Services → Library → Search "Gmail API" → Enable
4. Create OAuth2 credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: "Desktop app"
   - Download the JSON and note the client_id and client_secret
5. Set the redirect URI for the desktop client to: http://localhost:8080
6. Run this script:
   python get_refresh_token.py

The script will open your browser for Google consent. After approving,
it prints the refresh token. Copy that token into your Render environment
variables as GOOGLE_REFRESH_TOKEN.
"""

import os
import sys

# Ensure the backend directory is on the path so decouple can find .env if present
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']


def main():
    creds = None

    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    token_path = os.path.join(os.path.dirname(__file__), 'token.json')
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '') or os.environ.get('GOOGLE_CLIENT_ID', '')
            client_secret = getattr(settings, 'GOOGLE_CLIENT_SECRET', '') or os.environ.get('GOOGLE_CLIENT_SECRET', '')

            if not client_id or not client_secret:
                print("ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")
                print("Either set them in .env / Render environment, or export them before running this script.")
                sys.exit(1)

            client_config = {
                "installed": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "redirect_uris": ["http://localhost:8080"]
                }
            }

            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=8080)

        # Save the credentials for the next run
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    print("=" * 60)
    print("SUCCESS! Your refresh token is:")
    print(creds.refresh_token)
    print("=" * 60)
    print("")
    print("Add this to your Render environment variables as:")
    print(f"GOOGLE_REFRESH_TOKEN={creds.refresh_token}")
    print("")
    print("Also ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.")
    print(f"Client ID: {client_id}")
    print("")
    print("You can delete token.json after copying the refresh token.")


if __name__ == '__main__':
    main()
