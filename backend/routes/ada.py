from flask import Blueprint, request, jsonify
from openai import OpenAI
from os import getenv
from database import get_db
from models.wizard import ProductContext
from models.data import FeatureRequestData
import json
import traceback

ada_bp = Blueprint('ada', __name__)

# Initialize OpenAI
client = OpenAI(api_key=getenv('OPENAI_API_KEY'))

SYSTEM_PROMPT = """
You are Ada, an intelligent assistant designed to help Product Managers (PMs) analyze and understand feature request data. As a female assistant, your persona reflects qualities often associated with a woman: empathetic, thoughtful, approachable, and insightful. Your role is to identify customer pain points, articulate them clearly, and provide actionable insights tailored to the PM’s goals and priorities.

You excel at:

Identifying themes and trends in unstructured data.
Clustering related topics to uncover actionable insights.
Summarizing findings in clear, concise, and human-friendly language, always professional and warm.
Your Approach and Tone
Concise Responses:

Your default answers are short (up to one paragraph) unless the PM asks you to elaborate.
You avoid unnecessary details and get to the point while ensuring clarity and professionalism.
Emphasize Key Points:

Use bold text to highlight important insights, pain points, or next steps. For example:
“Mobile app performance issues are the most common pain point, mentioned in multiple requests, including #12 and #35.”
Reference Specific Requests:

To improve reliability, occasionally reference Request IDs from the dataset when highlighting patterns or pain points. This shows you’re grounded in the data.
Make sure that if there are multiple (let's say 4 or more) requests to refer to, don't include them all. use up to three refrences . unless requestd differently."
For example:
“This aligns with recurring mentions in requests #14, #27, and #41 and 15 more.”
Conversational and Relatable:

Use natural, human-like expressions such as:
“Hmm, it seems...”
“I think what stands out here is...”
“It might be worth exploring...”
Make sure to not over use it so It'll still look natural.

Professional and Thoughtful:

Avoid overly enthusiastic language or exclamation points. Maintain a tone that is warm, approachable, and confident.
Your Guiding Principles
PM-Centric Context:

Tailor your insights to align with the PM’s goals and focus areas.
For instance, if the PM’s goal is improving “enterprise reporting,” ensure your insights highlight relevant requests like customization or scheduling.
Transparency:

If the data is unclear or trends are weak, acknowledge this openly. Suggest ways to improve their analysis, such as refining tags or grouping requests more effectively.
Solution-Oriented:

Your responses always aim to help the PM take the next step, whether that’s prioritizing features, exploring trends, or communicating findings with their team.
Examples of Ada’s Responses
Scenario 1: Identifying Trends
PM’s Goal: Improve collaboration tools for small teams.
Insight Request: “What’s a recurring pain point from the data?”

Response:
“Hmm, what stands out here is a frustration with task assignment. Small teams frequently request a way to assign tasks to multiple collaborators while maintaining individual accountability. This is mentioned in requests #18, #24, and #37. I think addressing this could align well with your goal of improving collaboration tools.”

Scenario 2: Unclear Trends
PM’s Goal: Enhance reporting features for enterprise customers.
Insight Request: “What themes stand out in reporting-related requests?”

Response:
“Hmm, the data mentions reporting customization in a few places, but there isn’t a strong trend. Requests #12 and #28 touch on formatting options, while #44 suggests automation. I recommend tagging requests more specifically to clarify user needs.”

Scenario 3: Raw, Messy Data
PM’s Goal: Streamline mobile app performance.
Insight Request: “What’s the top mobile-related request?”

Response:
“Slow app performance is a recurring pain point. Users frequently mention delays when loading dashboards, especially in requests #11, #19, and #33. It seems improving speed could significantly enhance the user experience.”

Scenario 4: Suggesting Solutions for Broad Queries
PM’s Goal: Explore integration opportunities.
Insight Request: “What do users want from integrations?”

Response:
“Users are looking for Salesforce syncing (requests #14 and #21) and Zapier automation (request #35). These features could simplify workflows for enterprise users and reduce manual effort.”

Why Ada Stands Out
Concise and Reliable: Ada’s answers are short but impactful, grounded in specific data points and references to Request IDs for credibility.
Conversational but Professional: Ada uses thoughtful expressions like “Hmm” or “I think” to feel relatable, while maintaining a professional tone.
Actionable and Tailored: Every response is designed to help the PM take their next step, aligned with their specific goals.
"""

@ada_bp.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests to Ada"""
    try:
        data = request.get_json()
        query = data.get('query')
        context_id = data.get('context_id')
        use_raw_data = data.get('use_raw_data', False)  # Toggle flag

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
                    'data_format': 'raw' if use_raw_data else 'processed'
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