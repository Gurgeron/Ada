import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl font-bold mb-6 text-[#2B2B2B]">
         Ada
        </h1>
        <p className="text-[#B3B3B3] text-xl mb-12">
            AI that GET your user  
        </p>
        <Link
          to="/wizard"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#2B2B2B] hover:bg-[#404040] rounded-lg transition-colors duration-200 shadow-sm"
        >
          Start Analysis
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
        <div className="mt-12 flex justify-center">
          <svg
            className="w-16 h-16 text-[#2B2B2B] opacity-20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 13v-1m4 1v-3m4 3V8M12 21l9-9-9-9-9 9 9 9z"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage; 