from flask import Blueprint, jsonify, current_app, send_file, url_for
import os
from datetime import datetime
import openai
from openai import OpenAI
import json
import tempfile
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

podcast_bp = Blueprint('podcast', __name__)

# Initialize OpenAI client using environment variable
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

if not os.getenv('OPENAI_API_KEY'):
    print("Warning: OPENAI_API_KEY not found in environment variables")

def ensure_audio_directory():
    """Ensure the audio directory exists and is accessible."""
    static_dir = os.path.join(current_app.root_path, 'static')
    audio_dir = os.path.join(static_dir, 'audio')
    os.makedirs(audio_dir, exist_ok=True)
    return audio_dir

def generate_podcast_script(insights_data):
    """Generate a podcast script using OpenAI."""
    try:
        if not insights_data:
            raise ValueError("No insights data provided")

        # Ensure we have the required data
        required_fields = ['most_common_requests', 'top_pain_points', 'trends_over_time']
        missing_fields = [field for field in required_fields if field not in insights_data]
        if missing_fields:
            raise ValueError(f"Missing required insights data: {', '.join(missing_fields)}")

        prompt = f"""
        Create a concise 3-minute podcast script (maximum 2000 characters) summarizing these feature request insights:
        {json.dumps(insights_data, indent=2)}
        
        Format:
        1. Brief welcome (2-3 sentences)
        2. Top 3 pain points (1-2 sentences each)
        3. Most requested features (1-2 sentences)
        4. Key trend highlight (1-2 sentences)
        5. Quick actionable recommendation (1-2 sentences)
        6. Brief closing (1 sentence)
        
        Keep it concise and focused. No music cues or sound effects.
        """

        completion = client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": "You are an expert product analyst creating a very concise podcast summary. Keep it under 2000 characters."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        script = completion.choices[0].message.content
        if not script:
            raise ValueError("Generated script is empty")
        
        # Ensure script is within TTS limits
        if len(script) > 4000:  # Leave some buffer
            script = script[:3900] + "...\n\nThank you for listening."
            
        return script
    except Exception as e:
        print(f"Error generating script: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise

def convert_script_to_speech(script):
    """Convert the script to speech using OpenAI's TTS."""
    try:
        if not script or len(script.strip()) < 10:
            raise ValueError("Script is too short or empty")

        if len(script) > 4096:
            raise ValueError(f"Script is too long ({len(script)} characters). Maximum is 4096 characters.")

        # Create a temporary file with .mp3 extension
        temp_dir = tempfile.mkdtemp()
        temp_file = os.path.join(temp_dir, "temp_audio.mp3")

        # Generate speech
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=script
        )
        
        # Stream response to file
        response.stream_to_file(temp_file)
        
        # Verify file exists and has content
        if not os.path.exists(temp_file):
            raise ValueError("Failed to create audio file")
        
        if os.path.getsize(temp_file) == 0:
            raise ValueError("Generated audio file is empty")
            
        return temp_file
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        print(f"Script length: {len(script)} characters")
        print(f"Traceback: {traceback.format_exc()}")
        raise

@podcast_bp.route('/audio/<filename>')
def get_audio(filename):
    """Serve the audio file."""
    try:
        audio_dir = ensure_audio_directory()
        file_path = os.path.join(audio_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({
                'status': 'error',
                'message': 'Audio file not found'
            }), 404
            
        return send_file(
            file_path,
            mimetype='audio/mpeg',
            as_attachment=False  # Changed to False to allow streaming
        )
    except Exception as e:
        print(f"Error serving audio file: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to serve audio file'
        }), 500

@podcast_bp.route('/download/<filename>')
def download_audio(filename):
    """Download the audio file."""
    try:
        audio_dir = ensure_audio_directory()
        file_path = os.path.join(audio_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({
                'status': 'error',
                'message': 'Audio file not found'
            }), 404
            
        return send_file(
            file_path,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=f"feature_insights_{datetime.now().strftime('%Y%m%d')}.mp3"
        )
    except Exception as e:
        print(f"Error downloading audio file: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to download audio file'
        }), 500

@podcast_bp.route('/generate-podcast/<context_id>', methods=['POST'])
def generate_podcast(context_id):
    try:
        if not context_id:
            return jsonify({
                'status': 'error',
                'message': 'No context ID provided'
            }), 400

        # Get insights data from the insights endpoint
        from routes.insights import fetch_insights
        insights_response = fetch_insights(context_id)
        insights_data = insights_response.get_json()
        
        # Generate podcast script
        script = generate_podcast_script(insights_data)
        
        # Convert script to speech
        temp_audio_path = convert_script_to_speech(script)
        
        # Ensure audio directory exists
        audio_dir = ensure_audio_directory()
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'podcast_{context_id}_{timestamp}.mp3'
        final_path = os.path.join(audio_dir, filename)
        
        # Copy the file to the static directory
        import shutil
        shutil.copy2(temp_audio_path, final_path)
        
        # Clean up temporary file
        os.remove(temp_audio_path)
        os.rmdir(os.path.dirname(temp_audio_path))
        
        # Verify the final file exists and has content
        if not os.path.exists(final_path) or os.path.getsize(final_path) == 0:
            return jsonify({
                'status': 'error',
                'message': 'Failed to save audio file'
            }), 500
        
        # Generate URLs for streaming and download
        base_url = current_app.config.get('BASE_URL', 'http://localhost:3002')
        stream_url = f"{base_url}/api/podcast/audio/{filename}"
        download_url = f"{base_url}/api/podcast/download/{filename}"
        
        # Return the URLs for the audio file
        response = {
            'status': 'success',
            'message': 'Podcast generated successfully',
            'podcast_url': stream_url,
            'download_url': download_url,
            'duration': '3:00',
            'generated_at': datetime.now().isoformat(),
            'script': script
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error in podcast generation: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500