from flask import Blueprint, jsonify
from datetime import datetime, timedelta
import random

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/fetch-insights/<context_id>')
def fetch_insights(context_id):
    # Mock data for insights
    mock_insights = {
        'most_common_requests': [
            {'name': 'API Integration', 'count': 15},
            {'name': 'Mobile Support', 'count': 12},
            {'name': 'Custom Reports', 'count': 10}
        ],
        'top_pain_points': [
            {'name': 'Performance Issues', 'percentage': 75},
            {'name': 'Limited Features', 'percentage': 60},
            {'name': 'UI/UX Complexity', 'percentage': 45}
        ],
        'most_engaged_customers': [
            {'customer': 'Enterprise Co', 'requests': 8},
            {'customer': 'Tech Solutions', 'requests': 6},
            {'customer': 'Digital Corp', 'requests': 5}
        ],
        'requests_by_category': [
            {'category': 'Feature Enhancement', 'percentage': 40},
            {'category': 'Bug Fix', 'percentage': 25},
            {'category': 'New Feature', 'percentage': 20},
            {'category': 'Integration', 'percentage': 15}
        ],
        'trends_over_time': [
            {'month': 'Jan', 'requests': random.randint(10, 30)},
            {'month': 'Feb', 'requests': random.randint(10, 30)},
            {'month': 'Mar', 'requests': random.randint(10, 30)},
            {'month': 'Apr', 'requests': random.randint(10, 30)},
            {'month': 'May', 'requests': random.randint(10, 30)},
            {'month': 'Jun', 'requests': random.randint(10, 30)}
        ],
        'requests_by_customer_type': [
            {'type': 'Enterprise', 'count': 45, 'percentage': 45},
            {'type': 'Mid-Market', 'count': 30, 'percentage': 30},
            {'type': 'Small Business', 'count': 25, 'percentage': 25}
        ],
        'average_priority_score': {
            'score': '8.5',
            'description': 'Based on customer impact and business value'
        }
    }
    
    return jsonify(mock_insights) 