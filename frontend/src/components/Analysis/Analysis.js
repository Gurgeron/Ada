import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { ChartBarIcon, TableCellsIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function Analysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/data/latest`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
          <p className="mt-2 text-gray-600">
            Here's what we found in your feature requests data
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Summary</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Features</p>
                <p className="text-2xl font-bold">{data?.summary?.total_features || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority Features</p>
                <p className="text-2xl font-bold text-red-600">
                  {data?.summary?.high_priority || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Feature List Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <TableCellsIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Top Features</h2>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Feature
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.features?.slice(0, 5).map((feature, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {feature.title}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${feature.priority === 'high' ? 'bg-red-100 text-red-800' :
                              feature.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}
                        >
                          {feature.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 