import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SLIDES, PHOTOS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface SlideshowProps {
  onComplete: () => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTap = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // Get photo for current slide (loop if more slides than photos, or just mapping index)
  // We have 11 photos, 6 slides. We can just pick based on index.
  const photo = PHOTOS[currentIndex % PHOTOS.length];

  return (
    <div
      onClick={handleTap}
      className="min-h-screen w-full flex flex-col items-center justify-center cursor-pointer p-6 z-10 relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 4 - 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, x: -100, rotate: -5 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl w-full flex flex-col items-center"
        >
          {/* Photo Card */}
          <div className="bg-white p-4 pb-16 shadow-2xl rotate-1 transform transition-transform hover:rotate-0 duration-500 mb-8 max-w-sm w-full mx-auto relative group">
            <div className="aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={photo.url}
                alt="Memory"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            {/* Tape effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/50 rotate-3 backdrop-blur-sm shadow-sm"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl border border-white/60 text-center relative overflow-hidden w-full max-w-2xl">
            <p className="text-2xl md:text-4xl text-valentine-800 font-script leading-tight drop-shadow-sm">
              {SLIDES[currentIndex].text}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex justify-center items-center gap-2 text-valentine-500 text-xs font-bold uppercase tracking-widest animate-pulse"
            >
              <span>Tap</span>
              <ChevronRight size={14} />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Slideshow;