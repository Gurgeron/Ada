import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { InsightsProvider } from './context/InsightsContext';

function App() {
  return (
    <Router>
      <InsightsProvider>
        <AppRoutes />
      </InsightsProvider>
    </Router>
  );
}

export default App; 