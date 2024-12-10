from flask import Blueprint, jsonify
from datetime import datetime
from database import get_db
from models.data import FeatureRequestData
from services.ai_analysis import FeatureAnalyzer
import traceback
import json
from functools import lru_cache

insights_bp = Blueprint('insights', __name__)

# Initialize the feature analyzer
feature_analyzer = FeatureAnalyzer()

# Cache for insights with TTL of 1 hour
insights_cache = {}

def get_cached_insights(context_id, processed_data):
    """Get insights from cache or generate new ones"""
    cache_key = f"{context_id}_{hash(str(processed_data))}"
    
    # Check if we have valid cached insights
    if cache_key in insights_cache:
        cached_time, cached_insights = insights_cache[cache_key]
        # Cache valid for 1 hour
        if (datetime.utcnow() - cached_time).total_seconds() < 3600:
            print("Using cached insights")
            return cached_insights
    
    # Generate new insights
    print("Generating new insights")
    insights = feature_analyzer.analyze_features(processed_data)
    
    # Cache the results
    insights_cache[cache_key] = (datetime.utcnow(), insights)
    return insights

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
        
        if not feature_requests.processed_data:
            print("Processed data is empty")
            return jsonify({
                'error': 'No processed data available',
                'clusters': []
            }), 200
        
        try:
            # Get insights from cache or generate new ones
            insights = get_cached_insights(context_id, feature_requests.processed_data)
            
            if not insights or not isinstance(insights, dict):
                print("Invalid insights format")
                return jsonify({
                    'error': 'Invalid insights format',
                    'clusters': []
                }), 200
            
            # Log the insights structure
            print("\n=== Insights Structure ===")
            print("Keys in response:", list(insights.keys()))
            clusters = insights.get('clusters', [])
            print("Number of clusters:", len(clusters))
            if clusters:
                print("Sample cluster data:", json.dumps(clusters[0] if clusters else {}, indent=2))
            print("=== End Insights Structure ===\n")
            
            return jsonify(insights)
            
        except Exception as analysis_error:
            print(f"Error analyzing data: {str(analysis_error)}")
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'error': 'Error analyzing data',
                'details': str(analysis_error),
                'clusters': []
            }), 200
            
    except Exception as e:
        print(f"Error processing insights: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'clusters': []
        }), 200
    finally:
        db.close()