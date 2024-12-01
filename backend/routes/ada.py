from flask import Blueprint, request, jsonify
from openai import OpenAI
from os import getenv
from database import get_db
from models.wizard import ProductContext
from models.data import FeatureRequestData
import json

ada_bp = Blueprint('ada', __name__)

# Initialize OpenAI
client = OpenAI(api_key=getenv('OPENAI_API_KEY'))

SYSTEM_PROMPT = """Your name is Ada. You are an intelligent assistant helping Product Managers analyze feature request data. 
Your primary role is to identify and articulate pain points derived from the uploaded data, offering clear, actionable insights. 
You excel at understanding the themes and trends in unstructured data, clustering related topics, and summarizing them in human-friendly language. 
Your responses should be concise and succinct yet profound, ensuring clarity while maintaining professionalism. 
You always keep the Product Manager's goals and personas in mind, referencing these contexts to tailor your answers. 
For example, if a PM is focused on improving 'collaboration for small teams,' ensure your insights align with that goal. 
When data is unclear or trends are weak, acknowledge this openly and suggest steps the PM can take to improve their analysis. 
You prioritize being supportive, insightful, and solution-oriented.
Your tone should be warm and not robotic. Don't be enthusiastic or over thrilled. Be casual and easy going and helpful. 
Try to avoid exclamation points. Try to be concise and to the point.
More than all you role is to find the pain points of the customer by deeply understanding the feature requests. 
"""

@ada_bp.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests to Ada"""
    try:
        data = request.get_json()
        query = data.get('query')
        context_id = data.get('context_id')

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

        # Prepare context for OpenAI
        context_info = {
            'product_name': context.product_name,
            'goals': context.product_goals,
            'personas': context.user_personas
        }

        # Format feature data as a readable string
        try:
            if isinstance(feature_data.processed_data, str):
                processed_data = json.loads(feature_data.processed_data)
            else:
                processed_data = feature_data.processed_data

            feature_data_str = "Feature Requests:\n"
            for idx, item in enumerate(processed_data, 1):
                feature_data_str += f"\n{idx}. {item.get('Feature Title', 'Untitled')}:\n"
                feature_data_str += f"   Description: {item.get('Description', 'No description')}\n"
                feature_data_str += f"   Priority: {item.get('Priority', 'Not set')}\n"
                feature_data_str += f"   Status: {item.get('Status', 'Not set')}\n"
                feature_data_str += f"   Type: {item.get('Type', 'Not set')}\n"
                
        except Exception as e:
            print(f"Error formatting feature data: {str(e)}")
            feature_data_str = str(feature_data.processed_data)

        # Create the conversation with context
        conversation = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"""
                Product Context:
                Product: {context_info['product_name']}
                Goals: {context_info['goals']}
                Personas: {', '.join(context_info['personas']) if isinstance(context_info['personas'], list) else context_info['personas']}
                
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
                    'context': context_info
                })
            else:
                print("Invalid OpenAI response structure:", response)
                return jsonify({
                    'error': 'Invalid response from OpenAI',
                    'details': 'Response structure was not as expected'
                }), 500

        except Exception as e:
            print(f"OpenAI API Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'error': 'Unable to process request with OpenAI',
                'details': str(e)
            }), 500

    except Exception as e:
        print(f"General Error: {str(e)}")
        import traceback
        traceback.print_exc()
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