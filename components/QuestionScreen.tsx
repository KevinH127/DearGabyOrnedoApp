import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { random } from '../utils';
import { GIFS } from '../constants';

interface QuestionScreenProps {
  onYes: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({ onYes }) => {
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });

  // Logic to move button randomly within a large range
  const moveButton = () => {
    // Get viewport dimensions to ensure it doesn't fly off screen completely if possible,
    // but random large movement is fine for "impossible to press"
    const x = random(-200, 200);
    const y = random(-200, 200);
    setNoBtnPosition({ x, y });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">

      {/* Decorative Floral Corners (CSS shapes) */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-valentine-200 rounded-br-full opacity-50 -translate-x-10 -translate-y-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-valentine-200 rounded-tl-full opacity-50 translate-x-10 translate-y-10" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-valentine-300 rounded-bl-full opacity-30 translate-x-5 -translate-y-5" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-valentine-300 rounded-tr-full opacity-30 -translate-x-5 translate-y-5" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="w-full max-w-xl bg-white p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative transform rotate-1"
      >
        {/* Tape Effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/80 rotate-2 shadow-sm backdrop-blur-sm border-l border-r border-white/40"></div>

        {/* Polaroid Style Image */}
        <div className="bg-valentine-50 p-4 pb-12 shadow-inner mb-8 transform -rotate-2 border border-valentine-100 relative group">
          <div className="absolute -top-3 -right-3 text-3xl animate-bounce z-20">✨</div>
          <div className="overflow-hidden border-2 border-white shadow-sm">
            <img
              src="/images/before.jpeg"
              alt="Please?"
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center font-script text-valentine-800 text-xl opacity-70 rotate-1">
            For you ❤️
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-script text-valentine-800 mb-8 text-center leading-relaxed">
          May I be your Valentine?
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={onYes}
            className="bg-valentine-500 hover:bg-valentine-600 text-white text-2xl font-bold py-4 px-10 rounded-xl shadow-lg border-b-4 border-valentine-700 active:border-b-0 active:translate-y-1 transition-all w-full md:w-auto"
          >
            YES!
          </motion.button>

          <motion.button
            onMouseEnter={moveButton}
            animate={noBtnPosition}
            transition={{ type: "tween", ease: "circOut", duration: 0.2 }} // Fast movement
            className="bg-gray-300 text-gray-500 font-bold py-4 px-10 rounded-xl shadow-inner cursor-not-allowed opacity-80"
          >
            No
          </motion.button>
        </div>

        {/* Doodles */}
        <div className="absolute bottom-4 left-4 text-valentine-300 animate-pulse text-2xl">xoxo</div>
        <div className="absolute top-20 right-4 text-valentine-300 animate-pulse delay-700 text-xl">♥</div>

      </motion.div>
    </div>
  );
};

export default QuestionScreen;