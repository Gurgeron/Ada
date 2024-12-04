import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const SheetsCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the full URL including search params
        const fullUrl = window.location.href;
        
        // Send the complete callback URL to the backend
        const response = await axios.get(`${API_URL}/api/sheets/auth/google/callback`, {
          params: {
            callback_url: fullUrl
          },
          withCredentials: true
        });

        if (response.data.message === "Authentication successful") {
          navigate('/wizard?auth=success');
        } else {
          console.error('Unexpected response:', response.data);
          navigate('/wizard?auth=error');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/wizard?auth=error');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c9085] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default SheetsCallback; 