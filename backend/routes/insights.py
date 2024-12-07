from flask import Blueprint, jsonify
from datetime import datetime
from database import get_db
from models.data import FeatureRequestData
from services.ai_analysis import FeatureAnalyzer
import traceback
import json

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
            return jsonify({
                'error': 'No data found for this context',
                'clusters': []
            }), 200
        
        print(f"Found data record created at: {feature_requests.created_at}")
        print(f"Number of features: {len(feature_requests.processed_data)}")
        
        if not feature_requests.processed_data:
            print("Processed data is empty")
            return jsonify({
                'error': 'No processed data available',
                'clusters': []
            }), 200
        
        # Use AI-powered analyzer to process the data
        print("Starting feature analysis...")
        insights = feature_analyzer.analyze_features(feature_requests.processed_data)
        print("Feature analysis complete")
        
        # Log the insights structure
        print("\n=== Insights Structure ===")
        print("Keys in response:", list(insights.keys()))
        print("Number of clusters:", len(insights.get('clusters', [])))
        print("Sample cluster data:", json.dumps(insights.get('clusters', [])[0] if insights.get('clusters') else {}, indent=2))
        print("=== End Insights Structure ===\n")
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"Error processing insights: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'clusters': []
        }), 200
    finally:
        db.close()