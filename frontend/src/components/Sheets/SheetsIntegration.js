import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const SheetsIntegration = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a success message from authentication
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'success') {
      setIsAuthenticated(true);
      setSuccess('Successfully authenticated with Google Sheets!');
    }
  }, [location]);

  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/sheets/auth/google`, {
        withCredentials: true
      });
      
      if (response.data.auth_url) {
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setError('Failed to initialize Google authentication');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Extract spreadsheet ID from URL
      const spreadsheetId = spreadsheetUrl.match(/\/d\/(.*?)(\/|$)/)?.[1];
      if (!spreadsheetId) {
        throw new Error('Invalid Google Sheets URL');
      }

      // Update configuration
      await axios.post(`${API_URL}/api/sheets/config`, {
        spreadsheet_id: spreadsheetId,
        range_name: sheetName || 'Sheet1',
      }, {
        withCredentials: true
      });

      // Test the connection
      const syncResponse = await axios.post(`${API_URL}/api/sheets/sync`, {
        spreadsheet_id: spreadsheetId,
        range_name: sheetName || 'Sheet1',
      }, {
        withCredentials: true
      });

      if (syncResponse.data.data) {
        setSuccess('Successfully connected to spreadsheet!');
        // Navigate back to wizard after short delay
        setTimeout(() => navigate('/wizard'), 1500);
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to connect to spreadsheet');
      console.error('Sheets error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6 text-center">
          Google Sheets Integration
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {!isAuthenticated ? (
          <button
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="w-full bg-[#4c9085] text-white py-3 px-4 rounded-lg hover:bg-[#3d7269] transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.2 16.8l-4.8-4.8 1.68-1.68 3.12 3.12 6.72-6.72 1.68 1.68-8.4 8.4z" />
                </svg>
                Connect Google Sheets
              </>
            )}
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spreadsheet URL
              </label>
              <input
                type="text"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#4c9085] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sheet Name (Optional)
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Sheet1"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#4c9085] focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to use the first sheet
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4c9085] text-white py-3 px-4 rounded-lg hover:bg-[#3d7269] transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Connect to Spreadsheet'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SheetsIntegration; 