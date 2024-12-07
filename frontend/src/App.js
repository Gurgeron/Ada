import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { InsightsProvider } from './context/InsightsContext';
import { ClusterProvider } from './context/ClusterContext';

function App() {
  return (
    <Router>
      <InsightsProvider>
        <ClusterProvider>
          <AppRoutes />
        </ClusterProvider>
      </InsightsProvider>
    </Router>
  );
}

export default App; 