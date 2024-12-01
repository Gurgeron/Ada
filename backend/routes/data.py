from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.file_processor import FileProcessor, FileValidationError
from models.data import FeatureRequestData
from database import get_db
import traceback
import json

data_bp = Blueprint('data', __name__)

@data_bp.route('/upload', methods=['POST'])
def upload_file():
    """Process and store uploaded file"""
    try:
        print("\n=== FILE UPLOAD START ===")
        
        if 'file' not in request.files:
            print("❌ No file provided in request")
            return jsonify({'error': 'No file provided'}), 400

        if 'context_id' not in request.form:
            print("❌ No context_id provided in request")
            return jsonify({'error': 'No context_id provided'}), 400

        file = request.files['file']
        context_id = request.form['context_id']
        print(f"📁 Received file: {file.filename}")
        print(f"🔑 Context ID: {context_id}")

        if file.filename == '':
            print("❌ Empty filename")
            return jsonify({'error': 'No file selected'}), 400

        # Basic validation
        print("🔍 Validating file...")
        is_valid, message = FileProcessor.validate_file(file)
        if not is_valid:
            print(f"❌ Validation failed: {message}")
            return jsonify({'error': message}), 400
        print("✅ File validation successful")

        # Process file
        print("⚙️ Processing file...")
        processed_data, file_type = FileProcessor.process_file(file)
        print(f"✅ File processed successfully. Type: {file_type}")
        print(f"📊 Processed {len(processed_data)} records")

        # Save to database
        print("💾 Saving to database...")
        db = get_db()
        try:
            feature_request = FeatureRequestData(
                context_id=int(context_id),
                original_filename=secure_filename(file.filename),
                processed_data=processed_data,
                file_type=file_type
            )
            
            db.add(feature_request)
            db.commit()
            print("✅ Data saved successfully")
            print("\n=== FILE UPLOAD COMPLETE ===")

            return jsonify({
                'message': 'File uploaded successfully',
                'data': feature_request.to_dict()
            }), 201

        except Exception as db_error:
            print(f"❌ Database error: {str(db_error)}")
            print(traceback.format_exc())
            db.rollback()
            raise

    except Exception as e:
        print(f"❌ Error in upload_file: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    finally:
        if 'db' in locals():
            db.close()

@data_bp.route('/data/<int:context_id>', methods=['GET'])
def get_feature_requests(context_id):
    """Get processed feature requests for a context"""
    db = get_db()
    try:
        feature_requests = db.query(FeatureRequestData)\
            .filter_by(context_id=context_id)\
            .order_by(FeatureRequestData.created_at.desc())\
            .first()
        
        if not feature_requests:
            return jsonify({'error': 'No data found for this context'}), 404

        return jsonify(feature_requests.to_dict())
    finally:
        db.close() 