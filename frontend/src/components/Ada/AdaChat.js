import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Helper function to convert markdown-style bold to HTML
const formatMessage = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

// Predefined prompts that users can click on
const PREDEFINED_PROMPTS = [
  {
    text: "What are the top customer pain points?",
    description: "Identify most pressing customer issues"
  },
  {
    text: "Which features should we prioritize next?",
    description: "Get recommendations for feature prioritization"
  },
  {
    text: "Summarize the main feature request trends",
    description: "Overview of common patterns and themes"
  },
  {
    text: "What do enterprise customers want most?",
    description: "Focus on enterprise segment needs"
  },
  {
    text: "Show quick wins vs long-term projects",
    description: "Categorize by implementation effort"
  }
];

const AdaChat = ({ contextId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    setShowPrompts(false);
    setInput('');

    try {
      const response = await axios.post(`${API_URL}/api/ada/chat`, {
        query: text,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handlePromptClick = async (prompt) => {
    await sendMessage(prompt.text);
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
        {showPrompts && messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">Here are some questions you can ask:</p>
            <div className="grid gap-3">
              {PREDEFINED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isLoading}
                  className={`text-left p-3 rounded-lg border border-[#4c9085]/20 
                    ${isLoading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-[#4c9085] hover:bg-[#4c9085]/5 hover:shadow-sm'} 
                    transition-all duration-200 group`}
                >
                  <p className="text-[#4c9085] font-medium group-hover:text-[#3d7269]">
                    {prompt.text}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {prompt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        
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
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: formatMessage(message.content)
                }}
              />
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