import React, { createContext, useState, useContext } from 'react';

const InsightsContext = createContext();

export const InsightsProvider = ({ children }) => {
  const [cachedInsights, setCachedInsights] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState({});

  const cacheInsights = (contextId, data) => {
    setCachedInsights(prev => ({
      ...prev,
      [contextId]: data
    }));
    setLastFetchTime(prev => ({
      ...prev,
      [contextId]: Date.now()
    }));
  };

  const getCachedInsights = (contextId) => {
    const data = cachedInsights[contextId];
    const lastFetch = lastFetchTime[contextId];
    
    // Cache is valid for 5 minutes
    const isCacheValid = lastFetch && (Date.now() - lastFetch) < 5 * 60 * 1000;
    
    if (data && isCacheValid) {
      return data;
    }
    return null;
  };

  const clearCache = (contextId) => {
    if (contextId) {
      setCachedInsights(prev => {
        const newCache = { ...prev };
        delete newCache[contextId];
        return newCache;
      });
      setLastFetchTime(prev => {
        const newTimes = { ...prev };
        delete newTimes[contextId];
        return newTimes;
      });
    } else {
      setCachedInsights({});
      setLastFetchTime({});
    }
  };

  return (
    <InsightsContext.Provider value={{ 
      cacheInsights, 
      getCachedInsights, 
      clearCache,
      cachedInsights 
    }}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
}; 