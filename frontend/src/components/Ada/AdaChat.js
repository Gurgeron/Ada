import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const AdaChat = ({ contextId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/ada/chat`, {
        query: userMessage,
        context_id: contextId
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px] bg-white rounded-lg shadow-lg mx-4 my-2">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-[#4c9085]">Ada</h2>
          <p className="text-sm text-gray-500">Your Feature Request Analysis Assistant</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl ${
                message.role === 'user'
                  ? 'text-[#4c9085] font-medium'
                  : message.role === 'error'
                  ? 'text-red-500'
                  : 'text-gray-700'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#4c9085] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#4c9085] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#4c9085] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your feature requests..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c9085]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 rounded-lg font-medium ${
              isLoading || !input.trim()
                ? 'bg-gray-100 text-gray-400'
                : 'bg-[#4c9085] text-white hover:bg-[#3d7269]'
            } transition-colors`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdaChat; 