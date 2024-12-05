import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const PodcastCard = ({ contextId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [podcastScript, setPodcastScript] = useState(null);
  const [error, setError] = useState(null);
  const [showScript, setShowScript] = useState(false);

  const handleGeneratePodcast = async () => {
    if (!contextId) {
      setError('No context ID available. Please ensure you have uploaded data.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPodcastScript(null);
    setPodcastUrl(null);
    setDownloadUrl(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/podcast/generate-podcast/${contextId}`);
      
      if (response.data.status === 'success') {
        setPodcastUrl(response.data.podcast_url);
        setDownloadUrl(response.data.download_url);
        setPodcastScript(response.data.script);
      } else {
        throw new Error(response.data.message || 'Failed to generate podcast');
      }
    } catch (err) {
      console.error('Podcast generation error:', err);
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with an error
        const errorMessage = err.response.data?.message || 'Server error occurred';
        setError(`Failed to generate podcast: ${errorMessage}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Unable to reach the server. Please check your connection.');
      } else {
        // Something else went wrong
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setPodcastUrl(null);
    setDownloadUrl(null);
    setPodcastScript(null);
    handleGeneratePodcast();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span role="img" aria-label="headphones">🎧</span>
          Podcast Summary
        </h3>
        {podcastScript && (
          <button
            onClick={() => setShowScript(!showScript)}
            className="text-[#4c9085] hover:text-[#3D7269] text-sm font-medium"
          >
            {showScript ? 'Hide Script' : 'Show Script'}
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 text-center mb-4">
          <p className="mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="text-[#4c9085] hover:text-[#3D7269] text-sm font-medium underline"
          >
            Try Again
          </button>
        </div>
      )}
      
      {!podcastUrl && !isGenerating && !error && (
        <div className="text-center">
          <p className="text-[#2B2B2B] mb-4">
            Listen to a 3-minute podcast summarizing your feature request insights.
          </p>
          <button
            onClick={handleGeneratePodcast}
            className="bg-[#4c9085] text-white px-6 py-2 rounded-md hover:bg-[#3D7269] transition-colors duration-300"
            disabled={!contextId}
          >
            Generate Podcast
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c9085] mx-auto mb-4"></div>
          <p className="text-[#2B2B2B]">
            Generating your podcast... This may take up to 30 seconds.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            We're analyzing your data and creating a personalized summary.
          </p>
        </div>
      )}

      {podcastUrl && !isGenerating && (
        <div className="space-y-4">
          <p className="text-[#2B2B2B] mb-2">
            Your podcast is ready! Listen now or download for later.
          </p>
          <audio
            controls
            className="w-full"
            src={podcastUrl}
            preload="auto"
          >
            Your browser does not support the audio element.
          </audio>
          <div className="text-center">
            <a
              href={downloadUrl}
              className="inline-flex items-center text-[#4c9085] hover:text-[#3D7269] transition-colors duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download MP3
            </a>
          </div>
        </div>
      )}

      {showScript && podcastScript && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Podcast Script</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {podcastScript}
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastCard; 