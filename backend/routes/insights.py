from flask import Blueprint, jsonify
from datetime import datetime
from database import get_db
from models.data import FeatureRequestData
from services.ai_analysis import FeatureAnalyzer
import traceback

insights_bp = Blueprint('insights', __name__)

# Initialize the feature analyzer
feature_analyzer = FeatureAnalyzer()

@insights_bp.route('/fetch-insights/<context_id>')
def fetch_insights(context_id):
    """Fetch and process insights using AI-powered analysis"""
    db = get_db()
    try:
        print(f"\n=== Fetching insights for context {context_id} ===")
        
        # Get the most recent data for this context
        feature_requests = db.query(FeatureRequestData)\
            .filter_by(context_id=context_id)\
            .order_by(FeatureRequestData.created_at.desc())\
            .first()
        
        if not feature_requests:
            print(f"No data found for context {context_id}")
            return jsonify({'error': 'No data found for this context'}), 404
        
        print(f"Found data record created at: {feature_requests.created_at}")
        
        if not feature_requests.processed_data:
            print("Processed data is empty")
            return jsonify({'error': 'No processed data available'}), 404
        
        # Use AI-powered analyzer to process the data
        insights = feature_analyzer.analyze_features(feature_requests.processed_data)
        print("=== AI-powered insights processing complete ===\n")
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"Error processing insights: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()