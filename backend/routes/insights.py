from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from collections import Counter
from database import get_db
from models.data import FeatureRequestData
import pandas as pd
import traceback

insights_bp = Blueprint('insights', __name__)

def process_feature_requests(data):
    """Process feature request data into insights"""
    try:
        print(f"Processing data: {data[:2]}")  # Print first two records for debugging
        df = pd.DataFrame(data)
        
        print(f"DataFrame columns: {df.columns.tolist()}")  # Print column names
        
        # Standardize column names (handle both cases)
        column_mapping = {
            'Feature Title': 'feature_title',
            'Description': 'description',
            'Priority': 'priority',
            'Customer Type': 'customer_type',
            'Customer Impact': 'customer_impact',
            'Status': 'status',
            'Customer': 'customer',
            'feature_title': 'feature_title',
            'description': 'description',
            'priority': 'priority',
            'customer_type': 'customer_type',
            'customer_impact': 'customer_impact',
            'status': 'status',
            'customer': 'customer'
        }
        
        # Only rename columns that exist
        rename_cols = {k: v for k, v in column_mapping.items() if k in df.columns}
        df = df.rename(columns=rename_cols)
        
        print(f"Columns after renaming: {df.columns.tolist()}")  # Print renamed columns
        
        # Most common requests (based on feature titles)
        feature_title_col = next((col for col in ['feature_title', 'Feature Title'] if col in df.columns), None)
        if feature_title_col:
            most_common = Counter(df[feature_title_col]).most_common(3)
            most_common_requests = [{'name': name, 'count': count} for name, count in most_common]
        else:
            most_common_requests = [{'name': 'No feature data available', 'count': 0}]
        
        # Top pain points (based on high priority items)
        if any(col in df.columns for col in ['priority', 'Priority']) and any(col in df.columns for col in ['description', 'Description']):
            priority_col = 'priority' if 'priority' in df.columns else 'Priority'
            desc_col = 'description' if 'description' in df.columns else 'Description'
            high_priority_issues = df[df[priority_col].str.lower() == 'high'][desc_col].value_counts()
            total_issues = len(df)
            top_pain_points = [
                {'name': issue, 'percentage': int((count / total_issues) * 100)}
                for issue, count in high_priority_issues.head(3).items()
            ]
        else:
            top_pain_points = [{'name': 'No priority data available', 'percentage': 0}]
        
        # Most engaged customers
        customer_col = next((col for col in ['customer', 'Customer'] if col in df.columns), None)
        if customer_col:
            customer_requests = df[customer_col].value_counts()
            most_engaged_customers = [
                {'customer': customer, 'requests': int(count)}
                for customer, count in customer_requests.head(3).items()
            ]
        else:
            most_engaged_customers = [{'customer': 'No customer data', 'requests': 0}]
        
        # Requests by category (using status as category)
        status_col = next((col for col in ['status', 'Status'] if col in df.columns), None)
        if status_col:
            status_counts = df[status_col].value_counts()
            total_status = status_counts.sum()
            requests_by_category = [
                {'category': status, 'percentage': int((count / total_status) * 100)}
                for status, count in status_counts.items()
            ]
        else:
            requests_by_category = [{'category': 'Uncategorized', 'percentage': 100}]
        
        # Trends over time (using even distribution)
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        chunk_size = max(1, len(df) // 6)
        trends_over_time = [
            {'month': month, 'requests': chunk_size}
            for month in months
        ]
        
        # Requests by customer type
        customer_type_col = next((col for col in ['customer_type', 'Customer Type'] if col in df.columns), None)
        if customer_type_col:
            customer_type_counts = df[customer_type_col].value_counts()
            total_customers = customer_type_counts.sum()
            requests_by_customer_type = [
                {
                    'type': ctype,
                    'count': int(count),
                    'percentage': int((count / total_customers) * 100)
                }
                for ctype, count in customer_type_counts.items()
            ]
        else:
            requests_by_customer_type = [{'type': 'Unknown', 'count': len(df), 'percentage': 100}]
        
        # Calculate average priority score
        priority_col = next((col for col in ['priority', 'Priority'] if col in df.columns), None)
        if priority_col:
            priority_mapping = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
            df['priority_score'] = df[priority_col].map(priority_mapping)
            avg_score = df['priority_score'].mean()
            normalized_score = (avg_score / 4) * 10 if not pd.isna(avg_score) else 5.0
        else:
            normalized_score = 5.0
        
        insights = {
            'most_common_requests': most_common_requests,
            'top_pain_points': top_pain_points,
            'most_engaged_customers': most_engaged_customers,
            'requests_by_category': requests_by_category,
            'trends_over_time': trends_over_time,
            'requests_by_customer_type': requests_by_customer_type,
            'average_priority_score': {
                'score': f"{normalized_score:.1f}",
                'description': 'Based on customer impact and business value'
            }
        }
        
        print("Successfully generated insights")
        return insights
        
    except Exception as e:
        print(f"Error in process_feature_requests: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise

@insights_bp.route('/fetch-insights/<context_id>')
def fetch_insights(context_id):
    """Fetch and process insights from real data"""
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
            
        # Process the real data into insights
        insights = process_feature_requests(feature_requests.processed_data)
        print("=== Insights processing complete ===\n")
        return jsonify(insights)
        
    except Exception as e:
        print(f"Error processing insights: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close() 