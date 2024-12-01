import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        Understand what’s holding your customers back with Customer Pain Contemplator—your tool for decoding feature requests.   
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/wizard')}
          className="bg-[#2B2B2B] text-white px-8 py-4 rounded-lg text-lg font-semibold 
                   hover:bg-[#D4D4D4] hover:text-[#2B2B2B] transition-all duration-300"
        >
          Start Analysis
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingPage; 