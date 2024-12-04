import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const InsightCard = ({ title, value, subtitle, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-[#4c9085] mb-1">{value}</p>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

const Dashboard = ({ contextId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/insights/fetch-insights/${contextId}`);
        setInsights(response.data.insights);
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

  const { summary, priorities, statuses, products, customer_types, trends } = insights;

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard
          title="Total Requests"
          value={summary.total_requests}
          subtitle="Feature requests tracked"
        />
        <InsightCard
          title="Completion Rate"
          value={`${summary.completion_rate.toFixed(1)}%`}
          subtitle="Requests completed"
        />
        <InsightCard
          title="Active Products"
          value={Object.keys(products).length}
          subtitle="Products with requests"
        />
        <InsightCard
          title="Customer Segments"
          value={Object.keys(customer_types).length}
          subtitle="Unique customer types"
        />
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