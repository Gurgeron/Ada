from collections import Counter
from datetime import datetime

def analyze_feature_requests(feature_requests):
    """
    Analyze feature requests to generate insights about trends, priorities, and patterns.
    """
    total_requests = len(feature_requests)
    if total_requests == 0:
        return {}

    # Initialize counters and data structures
    priority_counts = Counter()
    status_counts = Counter()
    product_counts = Counter()
    customer_type_counts = Counter()
    monthly_trends = Counter()

    # Analyze each feature request
    for request in feature_requests:
        # Count priorities
        priority_counts[request.priority] += 1
        
        # Count statuses
        status_counts[request.status] += 1
        
        # Count products
        product_counts[request.product] += 1
        
        # Count customer types
        customer_type_counts[request.customer_type] += 1
        
        # Analyze monthly trends
        if request.request_date:
            month_key = request.request_date.strftime('%Y-%m')
            monthly_trends[month_key] += 1

    # Calculate percentages and prepare the insights
    insights = {
        'summary': {
            'total_requests': total_requests,
            'completion_rate': (status_counts.get('Completed', 0) / total_requests) * 100 if total_requests > 0 else 0
        },
        'priorities': {
            priority: {
                'count': count,
                'percentage': (count / total_requests) * 100
            }
            for priority, count in priority_counts.most_common()
        },
        'statuses': {
            status: {
                'count': count,
                'percentage': (count / total_requests) * 100
            }
            for status, count in status_counts.most_common()
        },
        'products': {
            product: {
                'count': count,
                'percentage': (count / total_requests) * 100
            }
            for product, count in product_counts.most_common()
        },
        'customer_types': {
            ctype: {
                'count': count,
                'percentage': (count / total_requests) * 100
            }
            for ctype, count in customer_type_counts.most_common()
        },
        'trends': {
            'monthly': dict(sorted(monthly_trends.items()))
        }
    }

    return insights 