import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHOTOS } from '../constants';

interface TransitionScreenProps {
  onComplete: () => void;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); 
  // 0: Flower blooms
  // 1: Photos cycle in center
  // 2: Flower expands to fill screen
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Cycle photos
  useEffect(() => {
    if (stage === 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % PHOTOS.length);
      }, 1200);

      // End stage 1 after one full cycle + a bit
      const timer = setTimeout(() => {
        clearInterval(interval);
        setStage(2);
      }, 1200 * PHOTOS.length + 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [stage]);

  // Start sequence
  useEffect(() => {
    // Stage 0 -> 1 (Bloom finish)
    const timer = setTimeout(() => {
      setStage(1);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle stage 2 completion
  useEffect(() => {
    if (stage === 2) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); // Wait for expansion to finish covering screen
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  // Generate petals
  const petals = Array.from({ length: 8 }).map((_, i) => ({
    rotation: i * 45,
    delay: i * 0.1,
  }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-valentine-900 overflow-hidden z-50">
      
      {/* Background to cover previous screen */}
      <motion.div 
        className="absolute inset-0 bg-valentine-900"
        initial={{ opacity: 1 }}
      />

      {/* The Magic Flower Container */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={
          stage === 2 
          ? { scale: 40, rotate: 90, transition: { duration: 1.5, ease: "easeInOut" } } 
          : { scale: 1, rotate: 0, transition: { duration: 1.5, ease: "easeOut" } }
        }
      >
        <div className="relative w-80 h-80 flex items-center justify-center">
          
          {/* Petals */}
          {petals.map((petal, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 origin-bottom-center"
              style={{ 
                left: '50%', 
                bottom: '50%', 
                marginLeft: '-4rem', // Half of width
                rotate: petal.rotation 
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: petal.delay, 
                duration: 0.8, 
                type: "spring",
                bounce: 0.5 
              }}
            >
              <div className="w-full h-full bg-gradient-to-t from-valentine-500 to-valentine-300 rounded-t-full rounded-b-[2rem] shadow-lg border-2 border-white/20" />
            </motion.div>
          ))}

          {/* Center (Stamen/Pistil) - Photos go here */}
          <motion.div 
            className="absolute w-40 h-40 bg-yellow-200 rounded-full z-20 overflow-hidden border-4 border-yellow-100 shadow-inner flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
             {/* Inner Photos */}
            <AnimatePresence mode="wait">
              {stage >= 1 && (
                <motion.img
                  key={currentPhotoIndex}
                  src={PHOTOS[currentPhotoIndex].url}
                  alt="Memory"
                  initial={{ opacity: 0, scale: 1.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </AnimatePresence>
            
            {/* Texture overlay for the center */}
            <div className="absolute inset-0 bg-yellow-400/20 mix-blend-overlay pointer-events-none" />
          </motion.div>
        </div>
      </motion.div>

      {/* Helper text */}
      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute bottom-10 md:bottom-20 text-valentine-100 text-2xl font-script z-20"
          >
            I'M NERVOUSSSSS.........
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransitionScreen;