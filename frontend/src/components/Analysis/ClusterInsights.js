import React, { useEffect, useState } from 'react';
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

  // Add state for tracking expanded clusters
  const [expandedClusters, setExpandedClusters] = useState({});

  // Toggle cluster expansion
  const toggleCluster = (clusterId) => {
    setExpandedClusters(prev => ({
      ...prev,
      [clusterId]: !prev[clusterId]
    }));
  };

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
      <div className="grid gap-4">
        {clusterData.map((cluster, index) => (
          <div 
            key={`cluster-${index}`} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200"
          >
            {/* Cluster Header - Always Visible */}
            <div 
              onClick={() => toggleCluster(index)}
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`transform transition-transform duration-200 ${expandedClusters[index] ? 'rotate-90' : ''}`}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M7.5 15L12.5 10L7.5 5" 
                      stroke="#4c9085" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{cluster.theme}</h3>
                  <p className="text-sm text-gray-600">
                    {cluster.size} feature requests
                  </p>
                </div>
              </div>
              {cluster.metadata && (
                <div className="bg-[#4c9085] text-white px-3 py-1 rounded-full text-sm">
                  {Math.round(cluster.metadata.high_priority_percentage || 0)}% High Priority
                </div>
              )}
            </div>

            {/* Expandable Content */}
            <div 
              className={`transition-all duration-300 ${
                expandedClusters[index] 
                  ? 'max-h-[500px] opacity-100' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="p-6 border-t border-gray-100">
                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-[#4c9085] scrollbar-track-gray-100">
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
          </div>
        ))}
      </div>

      {/* Add custom scrollbar styles to the head of the document */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4c9085;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #3d7269;
        }
      `}</style>
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