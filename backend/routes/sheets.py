from flask import Blueprint, request, jsonify, session, current_app, redirect
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2 import service_account
import os
from datetime import datetime
from database import db_session
from models.data import SheetsConfig
from urllib.parse import urlparse, parse_qs

sheets_bp = Blueprint('sheets', __name__)

# Configuration
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
]

@sheets_bp.route('/auth/google', methods=['GET'])
def google_auth():
    try:
        # Create the flow using the client secrets
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:3002/api/sheets/auth/google/callback"]
                }
            },
            scopes=SCOPES
        )
        
        flow.redirect_uri = "http://localhost:3002/api/sheets/auth/google/callback"
        
        # Generate URL for request to Google's OAuth 2.0 server
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        session['state'] = state
        return jsonify({"auth_url": authorization_url})
    except Exception as e:
        current_app.logger.error(f"Error in google_auth: {str(e)}")
        return jsonify({"error": "Failed to initialize Google OAuth flow"}), 500

@sheets_bp.route('/auth/google/callback')
def google_auth_callback():
    try:
        # Get the authorization code from the URL
        code = request.args.get('code')
        state = request.args.get('state')

        if not code:
            current_app.logger.error("No authorization code received")
            return redirect(os.getenv("FRONTEND_URL", "http://localhost:3000") + "/wizard?auth=error")

        if not state or state != session.get('state'):
            current_app.logger.error("State mismatch")
            return redirect(os.getenv("FRONTEND_URL", "http://localhost:3000") + "/wizard?auth=error")

        # Create the flow using the client secrets
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:3002/api/sheets/auth/google/callback"]
                }
            },
            scopes=SCOPES,
            state=state
        )
        
        flow.redirect_uri = "http://localhost:3002/api/sheets/auth/google/callback"
        
        # Exchange the authorization code for credentials
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Save credentials to database
        config = SheetsConfig(
            credentials=credentials.to_json(),
            last_sync=datetime.utcnow()
        )
        db_session.add(config)
        db_session.commit()

        return redirect(os.getenv("FRONTEND_URL", "http://localhost:3000") + "/wizard?auth=success")
    except Exception as e:
        current_app.logger.error(f"Error in google_auth_callback: {str(e)}")
        return redirect(os.getenv("FRONTEND_URL", "http://localhost:3000") + "/wizard?auth=error")

@sheets_bp.route('/sync', methods=['POST'])
def sync_sheets():
    config = SheetsConfig.query.order_by(SheetsConfig.id.desc()).first()
    if not config:
        return jsonify({"error": "No Google Sheets configuration found"}), 404

    credentials = Credentials.from_authorized_user_info(eval(config.credentials))
    service = build('sheets', 'v4', credentials=credentials)
    
    spreadsheet_id = request.json.get('spreadsheet_id')
    range_name = request.json.get('range_name', 'A1:D')  # Adjust default range as needed
    
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        values = result.get('values', [])
        
        # Update last sync time
        config.last_sync = datetime.utcnow()
        db_session.commit()
        
        return jsonify({
            "data": values,
            "last_sync": config.last_sync.isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sheets_bp.route('/config', methods=['POST'])
def update_config():
    data = request.json
    config = SheetsConfig.query.order_by(SheetsConfig.id.desc()).first()
    if not config:
        return jsonify({"error": "No Google Sheets configuration found"}), 404
    
    config.spreadsheet_id = data.get('spreadsheet_id')
    config.range_name = data.get('range_name')
    config.auto_sync = data.get('auto_sync', False)
    config.sync_interval = data.get('sync_interval', 3600)  # Default 1 hour
    
    db_session.commit()
    return jsonify({"message": "Configuration updated successfully"})

@sheets_bp.route('/status', methods=['GET'])
def get_status():
    config = SheetsConfig.query.order_by(SheetsConfig.id.desc()).first()
    if not config:
        return jsonify({"configured": False})
    
    return jsonify({
        "configured": True,
        "last_sync": config.last_sync.isoformat() if config.last_sync else None,
        "auto_sync": config.auto_sync,
        "sync_interval": config.sync_interval
    }) 