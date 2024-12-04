from flask import Blueprint, request, jsonify
from geventwebsocket import WebSocketError
from geventwebsocket.websocket import WebSocket
import numpy as np
import io
import os
import openai
import json
import base64
import logging
import time
import uuid
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

voice_chat_bp = Blueprint('voice_chat', __name__)

def send_event(ws, event_type, data):
    """Send an event through the WebSocket"""
    event = {
        "type": event_type,
        "data": data
    }
    ws.send(json.dumps(event))

def handle_websocket(ws):
    """Handle WebSocket connection for real-time audio conversation"""
    if not ws:
        logger.error("No WebSocket provided")
        return '', 400

    logger.info("New WebSocket connection established")
    session_id = str(uuid.uuid4())
    
    try:
        # Send session creation event
        send_event(ws, "session.create", {
            "session_id": session_id
        })

        # Configure session with voice settings
        send_event(ws, "session.update", {
            "session_id": session_id,
            "voice": "alloy"  # Using alloy voice as default
        })
        
        while not ws.closed:
            message = ws.receive()
            if message is None:
                continue

            try:
                event = json.loads(message)
                event_type = event.get('type')
                
                if event_type == 'session.init':
                    # Client initialized the session
                    logger.info(f"Session initialized: {session_id}")
                    continue
                    
                elif event_type == 'conversation.create':
                    # Start a new conversation
                    conversation_id = str(uuid.uuid4())
                    send_event(ws, "conversation.created", {
                        "conversation_id": conversation_id
                    })
                    
                elif event_type == 'speech.input':
                    # Handle incoming speech
                    audio_data = base64.b64decode(event['data']['audio'])
                    
                    # Save as WAV file
                    with io.BytesIO(audio_data) as wav_buffer:
                        # Transcribe audio
                        logger.debug("Transcribing audio")
                        transcript = openai.audio.transcriptions.create(
                            model="whisper-1",
                            file=("audio.wav", wav_buffer, "audio/wav"),
                            response_format="text"
                        )
                        logger.info(f"Transcribed text: {transcript}")
                        
                        if transcript.strip():
                            # Send transcription event
                            send_event(ws, "speech.transcribed", {
                                "text": transcript
                            })

                            # Get response from GPT
                            logger.debug("Getting GPT response")
                            completion = openai.chat.completions.create(
                                model="gpt-4",
                                messages=[
                                    {"role": "system", "content": "You are Ada, an AI assistant analyzing feature requests. Be concise and helpful."},
                                    {"role": "user", "content": transcript}
                                ]
                            )

                            response_text = completion.choices[0].message.content
                            logger.info(f"GPT response: {response_text}")

                            # Send text response event
                            send_event(ws, "text.response", {
                                "text": response_text
                            })

                            # Convert response to speech
                            logger.debug("Converting response to speech")
                            speech_response = openai.audio.speech.create(
                                model="tts-1",
                                voice="alloy",
                                input=response_text
                            )

                            # Send speech response event
                            send_event(ws, "speech.response", {
                                "audio": base64.b64encode(speech_response.content).decode('utf-8')
                            })

                elif event_type == 'session.close':
                    # Client requested to close the session
                    logger.info(f"Closing session: {session_id}")
                    break

            except json.JSONDecodeError:
                logger.error("Invalid JSON message received")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                send_event(ws, "error", {
                    "message": str(e)
                })

    except WebSocketError as e:
        logger.error(f"WebSocket error occurred: {str(e)}")
    finally:
        logger.info(f"Closing session: {session_id}")
        logger.info("Closing WebSocket connection")
        try:
            if not ws.closed:
                send_event(ws, "session.closed", {
                    "session_id": session_id
                })
                ws.close()
        except:
            pass

    return ''