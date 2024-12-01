import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const steps = [
  {
    id: 'product',
    name: 'Product Details',
    title: 'Tell us about your product',
    description: 'Start by providing your product name'
  },
  {
    id: 'goals',
    name: 'Product Goals',
    title: 'What are your product goals?',
    description: 'Describe the main objectives of your product'
  },
  {
    id: 'personas',
    name: 'User Personas',
    title: 'Who are your target users?',
    description: 'Define the key user personas for your product'
  },
  {
    id: 'upload',
    name: 'Feature Requests',
    title: 'Upload your feature requests',
    description: 'Import your feature request data to get started'
  }
];

export default function WizardForm({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    product_name: '',
    product_goals: '',
    user_personas: [],
    file: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileValidation, setFileValidation] = useState({ status: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload handling with react-dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFormData(prev => ({ ...prev, file }));
    
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(file.type)) {
        setFileValidation({
          status: 'error',
          message: 'Please upload a CSV or Excel file'
        });
        return;
      }

      setFileValidation({
        status: 'success',
        message: 'File ready to upload'
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePersonaChange = (e, index) => {
    const newPersonas = [...formData.user_personas];
    newPersonas[index] = e.target.value;
    setFormData(prev => ({
      ...prev,
      user_personas: newPersonas
    }));
  };

  const addPersona = () => {
    setFormData(prev => ({
      ...prev,
      user_personas: [...prev.user_personas, '']
    }));
  };

  const removePersona = (index) => {
    const newPersonas = [...formData.user_personas];
    newPersonas.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      user_personas: newPersonas
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const contextResponse = await axios.post(`${API_URL}/api/wizard/context`, {
        product_name: formData.product_name,
        product_goals: formData.product_goals,
        user_personas: formData.user_personas
      });

      if (formData.file) {
        const fileData = new FormData();
        fileData.append('file', formData.file);
        fileData.append('context_id', contextResponse.data.id);
        await axios.post(`${API_URL}/api/data/upload`, fileData);
      }

      setSuccess('Setup completed successfully!');
      setFormData({
        product_name: '',
        product_goals: '',
        user_personas: [],
        file: null
      });
      setFileValidation({ status: '', message: '' });
      
      // Call onComplete with the context ID
      if (onComplete) {
        onComplete(contextResponse.data.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return formData.product_name.trim() !== '';
      case 1:
        return formData.product_goals.trim() !== '';
      case 2:
        return formData.user_personas.length > 0 && 
               formData.user_personas.every(p => p.trim() !== '');
      case 3:
        return formData.file !== null && fileValidation.status === 'success';
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-[#89c6b7] bg-opacity-10">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold text-[#4c9085]">Ada Feature Request Analysis</h1>
          <p className="mt-2 text-gray-600">Set up your product context and upload feature requests for analysis</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <nav className="mb-12">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${index <= currentStep ? 'bg-[#4c9085] text-white' : 'bg-white text-gray-400 border border-gray-300'}`}
                  >
                    {index + 1}
                  </div>
                  <div 
                    className={`flex-1 h-px mx-2 ${index <= currentStep ? 'bg-[#4c9085]' : 'bg-gray-300'}`}
                    style={{ display: index === steps.length - 1 ? 'none' : 'block' }}
                  />
                </div>
                <span className={`mt-2 block text-xs ${index <= currentStep ? 'text-[#4c9085]' : 'text-gray-500'}`}>
                  {step.name}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-medium text-gray-900">{steps[currentStep].title}</h2>
            <p className="mt-1 text-sm text-gray-500">{steps[currentStep].description}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-[#89c6b7] bg-opacity-10 border border-[#4c9085] border-opacity-20 rounded-md">
                <p className="text-sm text-[#4c9085]">{success}</p>
              </div>
            )}

            <div className="space-y-6">
              {currentStep === 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4c9085] focus:ring-[#4c9085] sm:text-sm"
                      placeholder="Enter your product name"
                      required
                    />
                  </label>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Goals
                    <textarea
                      name="product_goals"
                      value={formData.product_goals}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4c9085] focus:ring-[#4c9085] sm:text-sm"
                      placeholder="What are the main objectives of your product?"
                      required
                    />
                  </label>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      User Personas
                    </label>
                    <button
                      type="button"
                      onClick={addPersona}
                      className="text-sm text-[#4c9085] hover:text-[#3d7269] font-medium"
                    >
                      + Add Persona
                    </button>
                  </div>
                  {formData.user_personas.length === 0 && (
                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
                      Add your target user personas (e.g., "Enterprise Developer", "Small Business Owner")
                    </p>
                  )}
                  {formData.user_personas.map((persona, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={persona}
                        onChange={(e) => handlePersonaChange(e, index)}
                        className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#4c9085] focus:ring-[#4c9085] sm:text-sm"
                        placeholder="Enter user persona"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removePersona(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <div
                    {...getRootProps()}
                    className={`p-8 border-2 border-dashed rounded-md text-center
                      ${isDragActive ? 'border-[#4c9085] bg-[#89c6b7] bg-opacity-5' : 'border-gray-300'}
                      ${fileValidation.status === 'success' ? 'border-[#4c9085] bg-[#89c6b7] bg-opacity-5' : ''}
                      ${fileValidation.status === 'error' ? 'border-red-300 bg-red-50' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <p className="text-sm text-gray-600">
                      {isDragActive
                        ? "Drop your file here"
                        : "Drag and drop your feature request file here, or click to browse"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a CSV or Excel file containing your feature requests
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Your file should have at least one column containing feature descriptions.
                      Additional columns for customer types and priorities will be automatically detected.
                    </p>
                  </div>

                  {fileValidation.status && (
                    <div className={`mt-3 text-sm text-center
                      ${fileValidation.status === 'success' ? 'text-[#4c9085]' : ''}
                      ${fileValidation.status === 'error' ? 'text-red-600' : ''}`}
                    >
                      {fileValidation.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !validateStep()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4c9085] rounded-md hover:bg-[#3d7269] disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Setup'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4c9085] rounded-md hover:bg-[#3d7269] disabled:opacity-50"
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 