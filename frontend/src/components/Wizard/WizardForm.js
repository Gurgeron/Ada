import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUploader } from "react-drag-drop-files";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const WizardForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: '',
    productGoals: '',
    userPersonas: '',
    file: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.productName.trim() !== '';
      case 2:
        return formData.productGoals.trim() !== '';
      case 3:
        return formData.file !== null;
      default:
        return true;
    }
  };

  const handleFileChange = (file) => {
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Submit context data
      const contextResponse = await axios.post(`${API_URL}/api/wizard/context`, {
        product_name: formData.productName,
        product_goals: formData.productGoals,
        user_personas: [formData.userPersonas]
      });

      // Upload file if present
      if (formData.file) {
        const fileData = new FormData();
        fileData.append('file', formData.file);
        fileData.append('context_id', contextResponse.data.id);
        await axios.post(`${API_URL}/api/data/upload`, fileData);
      }

      // Navigate to analysis page with context ID
      navigate(`/analysis?context_id=${contextResponse.data.id}`);
      
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during submission');
      console.error('Submission error:', err);
    }
  };

  const StepIndicator = ({ number, active, completed }) => (
    <div className="relative">
      {/* Main circle with transition */}
      <div
        className={`
          relative flex items-center justify-center w-12 h-12 rounded-full
          transition-all duration-300 ease-in-out
          ${completed ? 'bg-[#2B2B2B]' : active ? 'bg-[#D4D4D4]' : 'bg-[#B3B3B3]'}
          ${active ? 'ring-4 ring-[#D4D4D4] ring-opacity-50' : ''}
          shadow-sm
        `}
      >
        <span className={`
          font-mono text-lg tracking-wider font-semibold
          ${completed ? 'text-white' : active ? 'text-[#2B2B2B]' : 'text-white'}
          transform translate-y-[1px]
        `}>
          {completed ? '✓' : number}
        </span>
      </div>

      {/* Step label */}
      <div className={`
        absolute -bottom-6 left-1/2 transform -translate-x-1/2 
        text-xs font-medium tracking-wider uppercase
        ${active ? 'text-[#2B2B2B]' : 'text-[#B3B3B3]'}
        transition-all duration-300
      `}>
        {number === 1 ? 'Info' : number === 2 ? 'Goals' : 'Upload'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-12 gap-4">
          {[1, 2, 3].map((num) => (
            <StepIndicator
              key={num}
              number={num}
              active={step === num}
              completed={step > num}
            />
          ))}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-8 shadow-lg"
          >
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6">Product Information</h2>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full p-3 border border-[#D4D4D4] rounded-lg mb-4 focus:outline-none focus:border-[#2B2B2B]"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6">Product Goals</h2>
                <textarea
                  placeholder="What are your product goals?"
                  value={formData.productGoals}
                  onChange={(e) => setFormData({ ...formData, productGoals: e.target.value })}
                  className="w-full p-3 border border-[#D4D4D4] rounded-lg mb-4 h-32 focus:outline-none focus:border-[#2B2B2B]"
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6">Upload Feature Requests</h2>
                <FileUploader
                  handleChange={handleFileChange}
                  name="file"
                  types={["CSV", "XLSX"]}
                  classes="w-full p-8 border-2 border-dashed border-[#D4D4D4] rounded-lg text-center cursor-pointer hover:border-[#2B2B2B] transition-all duration-300"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="px-6 py-2 border border-[#D4D4D4] text-[#2B2B2B] rounded-lg hover:bg-[#D4D4D4] transition-all duration-300"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={step === 3 ? handleSubmit : handleNext}
                disabled={!validateStep()}
                className={`px-6 py-2 bg-[#2B2B2B] text-white rounded-lg ml-auto
                  ${!validateStep() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D4D4D4] hover:text-[#2B2B2B]'}
                  transition-all duration-300`}
              >
                {step === 3 ? 'Submit' : 'Next'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WizardForm; 