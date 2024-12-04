import React, { useState, useRef, useEffect } from 'react';
import './VoiceChat.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const WS_URL = API_URL.replace('http', 'ws');

const VoiceChat = ({ contextId }) => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    initializeWebSocket();
    return () => cleanupResources();
  }, []);

  const cleanupResources = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleWebSocketMessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received:', message);

      if (message.type === 'speech.transcribed') {
        setMessages(prev => [...prev, {
          role: 'user',
          content: message.data.text
        }]);
      } else if (message.type === 'text.response') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: message.data.text
        }]);
      } else if (message.type === 'speech.response') {
        const audio = new Audio(`data:audio/mp3;base64,${message.data.audio}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const initializeWebSocket = () => {
    wsRef.current = new WebSocket(`${WS_URL}/api/voice-chat/connect`);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      wsRef.current.send(JSON.stringify({
        type: 'session.create',
        data: { context_id: contextId }
      }));
    };

    wsRef.current.onmessage = handleWebSocketMessage;
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      setStatus('idle');
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const audioChunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          wsRef.current?.send(JSON.stringify({
            type: 'speech.input',
            data: { audio: base64Audio }
          }));
        };
        
        reader.readAsDataURL(audioBlob);
        setIsProcessing(false);
      };

      mediaRecorderRef.current.start();
      setIsActive(true);
      setStatus('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setStatus('idle');
  };

  const handleClick = async () => {
    if (isActive) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[#4c9085] text-white'
                  : message.role === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Voice Controls */}
      <div className="border-t p-4">
        <div className="flex justify-center items-center">
          <button
            onClick={handleClick}
            disabled={isProcessing}
            className={`voice-button ${isActive ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
            aria-label={isActive ? 'Stop recording' : 'Start recording'}
          >
            <div className="voice-button-inner">
              {isActive && <div className="voice-waves" />}
              {isProcessing && <div className="processing-indicator" />}
              <svg
                className="microphone-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 10v2a7 7 0 0 1-14 0v-2"
                />
                <line
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="12"
                  y1="19"
                  x2="12"
                  y2="23"
                />
                <line
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="8"
                  y1="23"
                  x2="16"
                  y2="23"
                />
              </svg>
            </div>
          </button>
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          {status === 'idle' && 'Click to start recording'}
          {status === 'recording' && 'Recording... Click to stop'}
          {status === 'error' && 'Error occurred. Please try again.'}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;