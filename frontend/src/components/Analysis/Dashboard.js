import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ClusterInsights from './ClusterInsights';
import InsightCard from '../Dashboard/InsightCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const Dashboard = ({ contextId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        console.log('Fetching insights for context:', contextId);
        const response = await axios.get(`${API_URL}/api/insights/fetch-insights/${contextId}`);
        console.log('Received insights:', response.data);
        setInsights(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Failed to load insights data');
        setLoading(false);
      }
    };

    if (contextId) {
      fetchInsights();
    }
  }, [contextId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c9085]"></div>
          <p className="mt-4 text-[#B3B3B3]">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-[#B3B3B3]">{error}</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center p-8">
        <p className="text-[#B3B3B3]">No insights available</p>
      </div>
    );
  }

  console.log('Rendering insights:', {
    mostCommon: insights.most_common_requests,
    painPoints: insights.top_pain_points,
    customers: insights.most_engaged_customers
  });

  const { summary, priorities, statuses, products, customer_types, trends, clusters } = insights;

  // Prepare chart data
  const priorityChartData = {
    labels: Object.keys(priorities),
    datasets: [{
      data: Object.values(priorities).map(p => p.count),
      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    }]
  };

  const statusChartData = {
    labels: Object.keys(statuses),
    datasets: [{
      data: Object.values(statuses).map(s => s.count),
      backgroundColor: ['#4c9085', '#FFD93D', '#6C5B7B', '#FF6B6B'],
    }]
  };

  const trendChartData = {
    labels: Object.keys(trends.monthly),
    datasets: [{
      label: 'Monthly Requests',
      data: Object.values(trends.monthly),
      borderColor: '#4c9085',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(76, 144, 133, 0.1)',
    }]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard
          title="Most Common Requests"
          data={insights.most_common_requests || []}
          type="list"
        />
        <InsightCard
          title="Top Pain Points"
          data={insights.top_pain_points || []}
          type="percentage"
        />
        <InsightCard
          title="Most Engaged Customers"
          data={insights.most_engaged_customers || []}
          type="list"
        />
      </div>

      {/* Cluster Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ClusterInsights clusters={insights.clusters || []} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Priority Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={priorityChartData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Overview</h3>
          <div className="h-64">
            <Bar
              data={statusChartData}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Trends</h3>
        <div className="h-64">
          <Line
            data={trendChartData}
            options={{
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 