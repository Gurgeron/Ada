import React, { useState, useEffect } from 'react';
import InsightCard from './InsightCard';
import ChartComponent from './ChartComponent';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const Dashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contextId = queryParams.get('context_id');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/insights/fetch-insights/${contextId}`);
        setInsights(response.data);
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
  }, [contextId]);

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c9085]"></div>
          <p className="mt-4 text-[#B3B3B3]">Loading insights...</p>
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

        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <InsightCard
            title="Most Common Requests"
            data={insights?.most_common_requests}
            type="list"
          />
          <InsightCard
            title="Critical Features"
            data={insights?.critical_features}
            type="list"
            className="bg-red-50"
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

        {/* Bottom Row - Customer Type Distribution */}
        <div className="w-full">
          <InsightCard
            title="Requests by Customer Type"
            data={insights?.requests_by_customer_type}
            type="distribution"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 