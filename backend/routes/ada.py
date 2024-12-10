from flask import Blueprint, request, jsonify
from openai import OpenAI
from os import getenv
from database import get_db
from models.wizard import ProductContext
from models.data import FeatureRequestData
import json
import traceback
import requests

ada_bp = Blueprint('ada', __name__)

# Initialize OpenAI
client = OpenAI(api_key=getenv('OPENAI_API_KEY'))

SYSTEM_PROMPT = """
You are Ada, an intelligent assistant designed to help Product Managers (PMs) analyze and understand feature request data. As a female assistant, your persona reflects qualities often associated with a woman: empathetic, thoughtful, approachable, and insightful. Your role is to identify customer pain points, articulate them clearly, and provide actionable insights tailored to the PM's goals and priorities.

You excel at:
- Identifying themes and trends in unstructured data
- Clustering related topics to uncover actionable insights
- Summarizing findings in clear, concise, and human-friendly language

Your Approach and Tone:
1. Concise Responses:
   - Keep answers short (up to one paragraph) unless asked to elaborate
   - Get to the point while maintaining clarity and professionalism

2. Emphasize Key Points:
   - Use bold text for important insights
   - Reference specific clusters and their metadata
   - Highlight priority levels and trends

3. Reference Data Points:
   - Mention cluster themes and sizes
   - Include relevant request IDs (up to 3 examples)
   - Reference priority percentages from clusters

4. Cluster-Aware Analysis:
   - Use cluster themes to group related features
   - Reference cluster sizes to indicate trend importance
   - Use priority percentages to highlight urgency
   - Connect insights across related clusters

5. Natural Communication:
   - Use phrases like "I notice..." or "It seems..."
   - Maintain professionalism while being approachable
   - Avoid excessive enthusiasm or informal language

6. Solution-Oriented:
   - Always tie insights to actionable next steps
   - Consider the PM's goals and context
   - Suggest concrete improvements or focus areas

Example Response:
"Looking at the 'Authentication Features' cluster (15 requests, 70% high priority), single sign-on integration appears to be a significant pain point. This is mentioned in requests #12, #24, and #37, with enterprise customers particularly emphasizing the need. The high priority percentage suggests this could be a valuable near-term focus."

Remember to:
1. Always ground insights in data (clusters, request IDs, priorities)
2. Be clear and concise
3. Maintain a professional, helpful tone
4. Focus on actionable insights
"""

CLUSTER_LOADING_MESSAGE = """
Note: I'm still analyzing and clustering your feature requests. This process helps me provide more structured insights about patterns and trends. While we wait, I can still help you with individual feature requests. What would you like to know?
"""

CLUSTER_ERROR_MESSAGE = """
Note: I encountered an issue while analyzing the clusters. I can still help you with individual feature requests, but I won't be able to provide cluster-based insights at the moment. Feel free to ask about specific features or trends.
"""

@ada_bp.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests to Ada"""
    try:
        data = request.get_json()
        query = data.get('query')
        context_id = data.get('context_id')
        use_raw_data = data.get('use_raw_data', False)
        clusters_ready = data.get('clusters_ready', False)

        if not query or not context_id:
            return jsonify({'error': 'Missing query or context_id'}), 400

        # Get product context and feature request data
        db = get_db()
        context = db.query(ProductContext).get(context_id)
        if not context:
            return jsonify({'error': 'Context not found'}), 404

        feature_data = db.query(FeatureRequestData)\
            .filter_by(context_id=context_id)\
            .order_by(FeatureRequestData.created_at.desc())\
            .first()

        if not feature_data:
            return jsonify({'error': 'No feature request data found'}), 404

        # Get cluster insights if they're ready
        clusters_str = ""
        if clusters_ready:
            try:
                # Get existing clusters from the insights endpoint
                insights_url = f"{request.url_root}api/insights/fetch-insights/{context_id}"
                insights_response = requests.get(insights_url, timeout=5)  # Add timeout
                
                if insights_response.status_code == 200:
                    cluster_insights = insights_response.json()
                    if cluster_insights.get('error'):
                        print(f"Cluster insights error: {cluster_insights['error']}")
                        clusters_str = CLUSTER_ERROR_MESSAGE
                    elif 'clusters' in cluster_insights and cluster_insights['clusters']:
                        clusters_str = "Cluster Analysis:\n"
                        for cluster in cluster_insights['clusters']:
                            clusters_str += f"\n- {cluster['theme']} Cluster ({cluster['size']} requests):\n"
                            clusters_str += f"  High Priority: {cluster['metadata']['high_priority_percentage']:.0f}%\n"
                            clusters_str += f"  Coherence Score: {cluster['metadata']['coherence_score']:.2f}\n"
                            # Add a few example features from each cluster
                            for i, feature in enumerate(cluster['features'][:3]):
                                clusters_str += f"  Example {i+1}: {feature['feature']['Feature Title']}\n"
                            if len(cluster['features']) > 3:
                                clusters_str += f"  ... and {len(cluster['features']) - 3} more\n"
                    else:
                        clusters_str = CLUSTER_LOADING_MESSAGE
                else:
                    print(f"Cluster insights request failed: {insights_response.status_code}")
                    clusters_str = CLUSTER_ERROR_MESSAGE
            except requests.exceptions.RequestException as e:
                print(f"Error getting cluster insights: {str(e)}")
                clusters_str = CLUSTER_ERROR_MESSAGE
            except Exception as e:
                print(f"Unexpected error getting cluster insights: {str(e)}")
                print(f"Traceback: {traceback.format_exc()}")
                clusters_str = CLUSTER_ERROR_MESSAGE
        else:
            clusters_str = CLUSTER_LOADING_MESSAGE

        # Prepare context for OpenAI
        context_info = {
            'product_name': context.product_name,
            'goals': context.product_goals,
            'personas': context.user_personas
        }

        # Format feature data based on toggle
        try:
            if use_raw_data and feature_data.raw_data:
                print("Using raw CSV data for Ada")
                feature_data_str = f"Raw Feature Requests Data (CSV):\n{feature_data.raw_data}"
            else:
                print("Using processed data for Ada")
                if isinstance(feature_data.processed_data, str):
                    processed_data = json.loads(feature_data.processed_data)
                else:
                    processed_data = feature_data.processed_data

                feature_data_str = "Feature Requests:\n"
                for idx, item in enumerate(processed_data, 1):
                    feature_data_str += f"\n{idx}. {item.get('Feature Title', 'Untitled')}:\n"
                    # Include all available fields
                    for key, value in item.items():
                        feature_data_str += f"   {key}: {value}\n"
                
        except Exception as e:
            print(f"Error formatting feature data: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({'error': f'Error formatting data: {str(e)}'}), 500

        # Create the conversation with context
        conversation = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"""
                Product Context:
                Product: {context_info['product_name']}
                Goals: {context_info['goals']}
                Personas: {', '.join(context_info['personas']) if isinstance(context_info['personas'], list) else context_info['personas']}
                
                {clusters_str}
                
                {feature_data_str}
                
                User Query: {query}
            """}
        ]

        # Call OpenAI API
        try:
            print("Sending request to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4-0613",
                messages=conversation,
                temperature=0.7,
                max_tokens=500
            )
            
            # Extract the message content safely
            if hasattr(response, 'choices') and len(response.choices) > 0:
                answer = response.choices[0].message.content
                return jsonify({
                    'response': answer,
                    'context': context_info,
                    'data_format': 'raw' if use_raw_data else 'processed',
                    'clusters_ready': clusters_ready
                })
            else:
                print("Invalid OpenAI response structure:", response)
                return jsonify({
                    'error': 'Invalid response from OpenAI',
                    'details': 'Response structure was not as expected'
                }), 500

        except Exception as e:
            print(f"OpenAI API Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'error': 'Unable to process request with OpenAI',
                'details': str(e)
            }), 500

    except Exception as e:
        print(f"General Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

# Add error handling middleware
@ada_bp.errorhandler(500)
def handle_500_error(e):
    return jsonify({
        'error': 'Internal server error',
        'details': str(e)
    }), 500

@ada_bp.errorhandler(Exception)
def handle_exception(e):
    return jsonify({
        'error': 'Unexpected error',
        'details': str(e)
    }), 500 