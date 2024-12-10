import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BubbleChart from './BubbleChart';
import DendrogramView from './DendrogramView';
import { useClusterContext } from '../../context/ClusterContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Move the styles outside the component
const scrollbarStyles = `
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
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = scrollbarStyles;
  document.head.appendChild(styleTag);
}

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
    clearCache,
    lastUpdated 
  } = useClusterContext();

  const [expandedClusters, setExpandedClusters] = useState({});
  const [activeTab, setActiveTab] = useState('bubble'); // 'bubble' or 'dendrogram'
  const [hierarchyData, setHierarchyData] = useState(null);

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
        
        // Transform cluster data into hierarchy format for dendrogram
        const hierarchy = {
          name: "All Features",
          children: response.data.clusters.map(cluster => ({
            name: cluster.theme,
            children: cluster.features.map(f => ({
              name: f.feature['Feature Title']
            }))
          }))
        };
        setHierarchyData(hierarchy);
        
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
      // Only fetch if we don't have data or if it's stale
      if (contextId && (!clusterData || !lastUpdated)) {
        if (isMounted) {
          await fetchClusters();
        }
      }
    };

    loadClusters();

    return () => {
      isMounted = false;
    };
  }, [contextId, clusterData, lastUpdated]);

  const handleRefresh = () => {
    clearCache();
    fetchClusters(true);
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${active 
          ? 'bg-[#4c9085] text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {label}
    </button>
  );

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
        <div>
          <h2 className="text-2xl font-semibold text-[#3D7269]">Cluster Analysis</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-[#4c9085] text-white rounded-md hover:bg-[#3d7269] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Visualization Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-x-2">
            <TabButton 
              id="bubble" 
              label="Bubble Chart" 
              active={activeTab === 'bubble'} 
            />
            <TabButton 
              id="dendrogram" 
              label="Hierarchy View" 
              active={activeTab === 'dendrogram'} 
            />
          </div>
          <div className="text-sm text-gray-500">
            {activeTab === 'bubble' 
              ? 'Size represents number of requests' 
              : 'Explore cluster relationships'}
          </div>
        </div>

        {/* Visualization Content */}
        <div className="relative" style={{ minHeight: '400px' }}>
          {activeTab === 'bubble' ? (
            <BubbleChart clusters={clusterData} />
          ) : (
            <DendrogramView hierarchyData={hierarchyData} />
          )}
        </div>
      </div>
      
      {/* Detailed Cluster Information */}
      <div className="grid gap-4">
        {clusterData.map((cluster, index) => (
          <div 
            key={`cluster-${index}`} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200"
          >
            {/* Cluster Header - Clickable */}
            <div 
              onClick={() => toggleCluster(cluster.id)}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-800">{cluster.theme}</h3>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedClusters[cluster.id] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
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
            </div>

            {/* Expandable Feature List */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                expandedClusters[cluster.id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 border-t border-gray-100">
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