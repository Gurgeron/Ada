import React, { useState } from 'react';
import WizardForm from './components/Wizard/WizardForm';
import AdaChat from './components/Ada/AdaChat';

function App() {
  const [contextId, setContextId] = useState(null);

  const handleWizardComplete = (id) => {
    setContextId(id);
  };

  return (
    <div className="min-h-screen bg-[#89c6b7] bg-opacity-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wizard Form */}
          <div className="lg:col-span-2">
            <WizardForm onComplete={handleWizardComplete} />
          </div>

          {/* Ada Chat */}
          {contextId && (
            <div className="lg:col-span-1">
              <AdaChat contextId={contextId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 