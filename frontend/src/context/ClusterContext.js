import React, { createContext, useState, useContext, useEffect } from 'react';

const ClusterContext = createContext();

const SESSION_STORAGE_KEY = 'ada_cluster_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const ClusterProvider = ({ children }) => {
  // Initialize state with data from session storage if available
  const [clusterData, setClusterData] = useState(() => {
    try {
      const savedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedData) {
        const { data, timestamp } = JSON.parse(savedData);
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
        // Clear invalid cache
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error loading cached cluster data:', error);
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Save to session storage whenever clusterData changes
  useEffect(() => {
    if (clusterData) {
      try {
        const cacheData = {
          data: clusterData,
          timestamp: Date.now()
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cacheData));
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        console.error('Error caching cluster data:', error);
      }
    }
  }, [clusterData]);

  const updateClusterData = (data) => {
    setClusterData(data);
  };

  const clearCache = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setClusterData(null);
      setLastUpdated(null);
      setError(null);
    } catch (error) {
      console.error('Error clearing cluster cache:', error);
    }
  };

  // Auto-clear cache if it's expired
  useEffect(() => {
    const checkCacheValidity = () => {
      try {
        const savedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedData) {
          const { timestamp } = JSON.parse(savedData);
          if (Date.now() - timestamp >= CACHE_DURATION) {
            clearCache();
          }
        }
      } catch (error) {
        console.error('Error checking cache validity:', error);
      }
    };

    checkCacheValidity();
    const interval = setInterval(checkCacheValidity, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <ClusterContext.Provider 
      value={{
        clusterData,
        isLoading,
        error,
        lastUpdated,
        setClusterData: updateClusterData,
        setIsLoading,
        setError,
        clearCache,
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
};

export const useClusterContext = () => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useClusterContext must be used within a ClusterProvider');
  }
  return context;
}; 