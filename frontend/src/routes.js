import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import WizardForm from './components/Wizard/WizardForm';
import Analysis from './components/Analysis/Analysis';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/wizard" element={<WizardForm />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 