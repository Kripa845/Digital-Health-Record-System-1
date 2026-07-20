import base64
import os
from email.mime.text import MIMEText

from django.conf import settings

try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False


def get_gmail_service():
    if not GOOGLE_AVAILABLE:
        raise ImportError(
            "google-api-python-client is not installed. "
            "Run: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib"
        )

    creds = Credentials(
        None,
        refresh_token=getattr(settings, 'GOOGLE_REFRESH_TOKEN', ''),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=getattr(settings, 'GOOGLE_CLIENT_ID', ''),
        client_secret=getattr(settings, 'GOOGLE_CLIENT_SECRET', ''),
    )
    return build('gmail', 'v1', credentials=creds)


def send_otp_email_gmail(email, otp_code, purpose="login"):
    service = get_gmail_service()

    subject = f"Your E-Health System OTP Code for {purpose.capitalize()}"
    message_text = (
        f"Hello,\n\n"
        f"Your one-time password (OTP) code is: {otp_code}\n\n"
        f"This code was requested for {purpose} and is valid for 5 minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"Best regards,\n"
        f"E-Health System Team"
    )

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@ehealth.com')

    message = MIMEText(message_text)
    message['to'] = email
    message['from'] = from_email
    message['subject'] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    result = service.users().messages().send(
        userId='me',
        body={'raw': raw}
    ).execute()

    print(f"[EMAIL] Gmail API response: id={result.get('id')}, labelIds={result.get('labelIds')}")
    return result
