import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Analysis from './Analysis';
import Dashboard from '../Dashboard/Dashboard';
import AdaChat from '../Ada/AdaChat';

const AnalysisContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const contextId = queryParams.get('context_id');
  const activeTab = queryParams.get('tab') || 'table';

  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', tab);
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  if (!contextId) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2B2B2B] mb-4">No Context Found</h2>
          <p className="text-[#B3B3B3]">Please complete the setup process first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Ada Header */}
        <div className="flex flex-col items-start mb-8">
          <div className="flex items-center justify-start gap-3">
            <h1 className="text-4xl font-bold text-[#2B2B2B]">
              Ada
            </h1>
            <svg
              className="w-8 h-8 text-[#2B2B2B] opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 13v-1m4 1v-3m4 3V8M12 21l9-9-9-9-9 9 9 9z"
              />
            </svg>
          </div>
          <p className="text-[#B3B3B3] text-xl mt-2">
            AI that GET your user
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center mb-6">
          {/* Enhanced Tab Navigation */}
          <div className="flex space-x-4 border-b border-gray-200 flex-grow">
            <button
              onClick={() => handleTabChange('table')}
              className={`px-8 py-4 text-base font-medium transition-all duration-200 relative
                ${activeTab === 'table'
                  ? 'text-[#4c9085] border-b-2 border-[#4c9085] bg-white -mb-[2px]'
                  : 'text-gray-600 hover:text-[#4c9085] hover:bg-gray-50'
                }
                rounded-t-lg flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Feature Table
            </button>
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`px-8 py-4 text-base font-medium transition-all duration-200 relative
                ${activeTab === 'dashboard'
                  ? 'text-[#4c9085] border-b-2 border-[#4c9085] bg-white -mb-[2px]'
                  : 'text-gray-600 hover:text-[#4c9085] hover:bg-gray-50'
                }
                rounded-t-lg flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'table' ? (
              <Analysis />
            ) : (
              <Dashboard />
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-8">
            <AdaChat contextId={contextId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisContainer; 