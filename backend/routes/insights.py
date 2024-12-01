from flask import Blueprint, jsonify
from models.feature_request import FeatureRequest
from sqlalchemy import func, desc
from database import get_db
from datetime import datetime
from collections import Counter
from difflib import SequenceMatcher
import traceback
import re

def similar(a, b, threshold=0.85):
    """Check if two strings are similar using SequenceMatcher"""
    # Normalize strings: lowercase and remove special characters
    a = re.sub(r'[^\w\s]', '', a.lower())
    b = re.sub(r'[^\w\s]', '', b.lower())
    return SequenceMatcher(None, a, b).ratio() > threshold

def cluster_similar_requests(requests):
    """Cluster similar feature requests together"""
    clusters = {}
    # Sort requests by length to prefer shorter, more concise names as cluster keys
    sorted_requests = sorted(requests, key=lambda x: len(x))
    
    for request in sorted_requests:
        found_cluster = False
        for cluster_key in clusters:
            if similar(request, cluster_key):
                clusters[cluster_key].append(request)
                found_cluster = True
                break
        if not found_cluster:
            clusters[request] = [request]
    
    # Return clusters with counts
    return {key: len(values) for key, values in clusters.items()}

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/fetch-insights/<context_id>', methods=['GET'])
def fetch_insights(context_id):
    try:
        print(f"\n=== FETCHING INSIGHTS FOR CONTEXT {context_id} ===")
        db = get_db()
        
        # Fetch feature requests for the given context
        feature_requests = db.query(FeatureRequest).filter_by(context_id=context_id).all()
        
        if not feature_requests:
            print("❌ No feature requests found")
            return jsonify({
                'error': 'No feature requests found for this context'
            }), 404
            
        print(f"✅ Found {len(feature_requests)} feature requests")
        
        # Generate insights
        total_requests = len(feature_requests)
        completed_requests = sum(1 for fr in feature_requests if fr.status == 'Completed')
        
        # Cluster similar feature titles
        titles = [fr.feature_title for fr in feature_requests if fr.feature_title]
        title_clusters = cluster_similar_requests(titles)
        
        # Count occurrences of requesters
        requester_counter = Counter(fr.requested_by for fr in feature_requests if fr.requested_by)
        
        # Priority analysis with proper counting
        priority_counts = Counter(fr.priority for fr in feature_requests if fr.priority)
        
        # Status analysis with proper counting
        status_counts = Counter(fr.status for fr in feature_requests if fr.status)
        
        # Product analysis with proper counting
        product_counts = Counter(fr.product for fr in feature_requests if fr.product)
        
        # Customer type analysis with proper counting
        customer_type_counts = Counter(fr.customer_type for fr in feature_requests if fr.customer_type)
        
        # Monthly trends with proper counting
        monthly_trends = Counter(
            fr.request_date.strftime('%Y-%m')
            for fr in feature_requests
            if fr.request_date
        )
        
        # High priority requests for pain points
        high_priority_requests = [
            fr.feature_title for fr in feature_requests
            if fr.priority == 'High' and fr.feature_title
        ]
        high_priority_clusters = cluster_similar_requests(high_priority_requests)
        
        # Critical features analysis
        critical_features = [
            fr.feature_title for fr in feature_requests
            if fr.priority == 'Critical' and fr.feature_title
        ]
        critical_clusters = cluster_similar_requests(critical_features)
        
        # Format insights
        insights = {
            'summary': {
                'total_requests': total_requests,
                'completion_rate': (completed_requests / total_requests * 100) if total_requests > 0 else 0
            },
            'priorities': {
                priority: {
                    'count': count,
                    'percentage': (count / total_requests * 100)
                }
                for priority, count in priority_counts.most_common()
            },
            'statuses': {
                status: {
                    'count': count,
                    'percentage': (count / total_requests * 100)
                }
                for status, count in status_counts.most_common()
            },
            'products': {
                product: {
                    'count': count,
                    'percentage': (count / total_requests * 100)
                }
                for product, count in product_counts.most_common()
            },
            'customer_types': {
                ctype: {
                    'count': count,
                    'percentage': (count / total_requests * 100)
                }
                for ctype, count in customer_type_counts.most_common()
            },
            'trends': {
                'monthly': dict(sorted(monthly_trends.items()))
            },
            'most_common_requests': [
                {'name': title, 'count': count}
                for title, count in sorted(
                    title_clusters.items(),
                    key=lambda x: (-x[1], x[0])  # Sort by count desc, then name asc
                )[:5]
            ],
            'top_pain_points': [
                {
                    'name': title,
                    'percentage': round((count / len(high_priority_requests) * 100), 1)
                }
                for title, count in sorted(
                    high_priority_clusters.items(),
                    key=lambda x: (-x[1], x[0])
                )[:5]
            ] if high_priority_requests else [],
            'most_engaged_customers': [
                {'customer': requester, 'requests': count}
                for requester, count in requester_counter.most_common(5)
            ],
            'requests_by_category': [
                {'category': cat, 'percentage': round((count / total_requests * 100), 1)}
                for cat, count in product_counts.most_common()
            ],
            'trends_over_time': [
                {'month': month, 'requests': count}
                for month, count in sorted(monthly_trends.items())
            ],
            'requests_by_customer_type': [
                {
                    'type': ctype,
                    'count': count,
                    'percentage': round((count / total_requests * 100), 1)
                }
                for ctype, count in customer_type_counts.most_common()
            ],
            'critical_features': [
                {
                    'name': title,
                    'count': count,
                    'percentage': round((count / total_requests * 100), 1)
                }
                for title, count in sorted(
                    critical_clusters.items(),
                    key=lambda x: (-x[1], x[0])  # Sort by count desc, then name asc
                )[:5]
            ] if critical_features else []
        }
        
        print("✅ Insights generated successfully")
        print("\n=== INSIGHTS FETCH COMPLETE ===")
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"❌ Error generating insights: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Failed to fetch insights: {str(e)}'
        }), 500
    finally:
        if 'db' in locals():
            db.close() 