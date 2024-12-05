import React, { useState, useEffect } from 'react';
import InsightCard from './InsightCard';
import ChartComponent from './ChartComponent';
import PodcastCard from './PodcastCard';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useInsights } from '../../context/InsightsContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const LoadingMessages = [
  "Brewing some insightful coffee...",
  "Let me count these feature requests...",
  "I'm discovering patterns in your data...",
  "Connecting the dots for you...",
  "Making your charts look pretty...",
  "Reading through customer feedback...",
  "Calculating priorities carefully...",
  "Almost there, just adding some sparkle✨"
];

const Dashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LoadingMessages[0]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contextId = queryParams.get('context_id');
  const { cacheInsights, getCachedInsights } = useInsights();

  useEffect(() => {
    let messageInterval;
    if (loading) {
      let messageIndex = 0;
      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % LoadingMessages.length;
        setLoadingMessage(LoadingMessages[messageIndex]);
      }, 2500);
    }
    return () => clearInterval(messageInterval);
  }, [loading]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Check cache first
        const cachedData = getCachedInsights(contextId);
        if (cachedData) {
          setInsights(cachedData);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/insights/fetch-insights/${contextId}`);
        
        // Get the feature data from the data endpoint
        const featureDataResponse = await axios.get(`${API_URL}/api/data/data/${contextId}`);
        
        // Process the feature data
        let processedData = [];
        if (featureDataResponse.data?.data) {
          processedData = featureDataResponse.data.data;
        } else if (featureDataResponse.data?.processed_data) {
          processedData = featureDataResponse.data.processed_data;
        } else if (Array.isArray(featureDataResponse.data)) {
          processedData = featureDataResponse.data;
        }
        
        // Combine insights with feature data
        const combinedData = {
          ...response.data,
          featureData: processedData
        };
        
        // Cache the data
        cacheInsights(contextId, combinedData);
        
        setInsights(combinedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights data');
        setLoading(false);
      }
    };

    if (contextId) {
      fetchInsights();
    }
  }, [contextId, cacheInsights, getCachedInsights]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4c9085] mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-[#4c9085]/10"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-[#4c9085] animate-pulse">{loadingMessage}</p>
          <p className="mt-2 text-sm text-[#B3B3B3]">This may take a minute as I analyze your data thoroughly</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-[#B3B3B3]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2B2B2B]">Insights Dashboard</h1>
          <p className="text-[#B3B3B3] mt-2">Overview of your feature request analysis</p>
        </div>

        {/* Podcast Card */}
        <PodcastCard contextId={contextId} />

        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard
            title="Most Common Requests"
            data={insights?.most_common_requests}
            type="list"
          />
          <InsightCard
            title="Top Pain Points"
            data={insights?.top_pain_points}
            type="percentage"
          />
          <InsightCard
            title="Most Engaged Customers"
            data={insights?.most_engaged_customers}
            type="list"
          />
        </div>

        {/* Middle Row - Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartComponent
            title="Requests by Category"
            data={insights?.requests_by_category}
            type="pie"
          />
          <ChartComponent
            title="Trends Over Time"
            data={insights?.trends_over_time}
            type="line"
          />
        </div>

        {/* Bottom Row - Focused Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard
            title="Requests by Customer Type"
            data={insights?.requests_by_customer_type}
            type="distribution"
          />
          <InsightCard
            title="Average Priority Score"
            data={insights?.average_priority_score}
            type="score"
          />
        </div>

        {/* Critical Features Card */}
        <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4c9085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Critical Priority Features
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {console.log('Feature Data in render:', insights?.featureData)}
            {insights?.featureData?.filter(feature => {
              console.log('Checking feature:', feature);
              const priority = feature.priority || feature.Priority;
              console.log('Priority value:', priority);
              return priority === 'Critical';
            }).map((feature, index) => (
              <div key={index} className="p-3 bg-[#f0f9f8] rounded-lg border border-[#4c9085]/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.feature_title || feature['Feature Title']}</h4>
                    <p className="text-sm text-gray-600 mt-1">{feature.description || feature.Description}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium bg-[#4c9085]/10 text-[#4c9085] rounded-full">
                    {feature.status || feature.Status || 'No Status'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-4 text-sm text-[#4c9085]">
                    <span>Impact: {feature.customer_impact || feature['Customer Impact'] || 'N/A'}</span>
                    <span>•</span>
                    <span>Customer: {feature.customer_type || feature['Customer Type'] || 'N/A'}</span>
                  </div>
                  <a
                    href={feature.jira_url || `https://your-jira-instance.atlassian.net/browse/${feature.jira_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-[#4c9085] hover:text-[#3D7269] transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Jira
                  </a>
                </div>
              </div>
            ))}
            {(!insights?.featureData?.some(feature => 
              (feature.priority || feature.Priority) === 'Critical'
            )) && (
              <div className="text-center text-gray-500 py-4">
                No critical priority features found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 