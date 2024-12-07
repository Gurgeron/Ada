import React, { useEffect } from 'react';
import axios from 'axios';
import BubbleChart from './BubbleChart';
import { useClusterContext } from '../../context/ClusterContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Simple loading spinner component
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative w-12 h-12">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="w-12 h-12 border-4 border-[#4c9085] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
    <p className="text-[#3D7269] text-lg font-medium animate-pulse">
      {message}
    </p>
  </div>
);

const ClusterInsights = ({ contextId }) => {
  const { 
    clusterData, 
    isLoading, 
    error, 
    setClusterData, 
    setIsLoading, 
    setError,
    clearCache 
  } = useClusterContext();

  const fetchClusters = async (force = false) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/insights/fetch-insights/${contextId}`);
      
      if (response.data.clusters) {
        setClusterData(response.data.clusters);
        setError(null);
      } else {
        setError('No cluster data available');
      }
    } catch (err) {
      setError('Failed to load clusters. Please try again later.');
      console.error('Error fetching clusters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadClusters = async () => {
      // Clear existing data when context changes
      if (contextId) {
        clearCache();
        if (isMounted) {
          await fetchClusters();
        }
      }
    };

    loadClusters();

    return () => {
      isMounted = false;
    };
  }, [contextId]);

  // Add refresh button
  const handleRefresh = () => {
    clearCache();
    fetchClusters(true);
  };

  if (isLoading) {
    return <LoadingSpinner message="Analyzing clusters..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-[#4c9085] text-white rounded-md hover:bg-[#3d7269] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!clusterData || clusterData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">No clusters available.</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-[#4c9085] text-white rounded-md hover:bg-[#3d7269] transition-colors"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#3D7269]">Cluster Analysis</h2>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-[#4c9085] text-white rounded-md hover:bg-[#3d7269] transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {/* Bubble Chart Visualization */}
      <BubbleChart clusters={clusterData} />
      
      {/* Detailed Cluster Information */}
      <div className="grid gap-6">
        {clusterData.map((cluster, index) => (
          <div key={`cluster-${index}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{cluster.theme}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {cluster.size} feature requests
                </p>
              </div>
              {cluster.metadata && (
                <div className="bg-[#4c9085] text-white px-3 py-1 rounded-full text-sm">
                  {Math.round(cluster.metadata.high_priority_percentage || 0)}% High Priority
                </div>
              )}
            </div>

            {/* Feature List */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Features in this cluster:</h4>
              <div className="space-y-4">
                {cluster.features && cluster.features.map((feature, featureIndex) => (
                  <div 
                    key={`feature-${index}-${featureIndex}`} 
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <h5 className="font-medium text-[#4c9085]">
                      {feature.feature['Feature Title']}
                    </h5>
                    <p className="text-sm text-gray-600 mt-2">
                      {feature.feature['Description']}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        getPriorityColor(feature.feature['Priority'])
                      }`}>
                        {feature.feature['Priority']}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {feature.feature['Customer Type']}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Utility function for priority colors
const getPriorityColor = (priority) => {
  const colors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export default React.memo(ClusterInsights); 