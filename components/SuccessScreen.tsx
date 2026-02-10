import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GIFS } from '../constants';

interface SuccessScreenProps {
  onContinue?: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onContinue }) => {
  // Simple particle system for confetti
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ['#f43f5e', '#ec4899', '#e11d48', '#be123c', '#fb7185'];
    const newParticles = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -50,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden">
      {/* Confetti */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: p.x, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            x: p.x + (Math.random() * 200 - 100),
            rotate: 720 * (Math.random() > 0.5 ? 1 : -1)
          }}
          transition={{
            duration: Math.random() * 3 + 3,
            ease: "linear",
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="absolute w-3 h-3 md:w-4 md:h-4 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="w-full max-w-lg bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 text-center shadow-[0_0_50px_rgba(244,63,94,0.3)] border-4 border-white mx-4"
      >
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-valentine-400 blur-2xl opacity-40 animate-pulse rounded-full"></div>
          <img
            src="/images/after.jpeg"
            alt="Celebration"
            className="w-64 h-64 object-cover rounded-3xl shadow-lg relative z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-script text-transparent bg-clip-text bg-gradient-to-br from-valentine-500 to-valentine-700 mb-6 drop-shadow-sm leading-tight">
          Yayyy! I knew it! (jk)
        </h1>
        <p className="text-xl md:text-2xl text-valentine-700 font-sans font-medium mb-8">
          I'm so happy to be your valentine! ❤️
        </p>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="inline-block bg-white px-8 py-4 rounded-full shadow-lg text-valentine-600 font-bold tracking-wide text-lg border-2 border-valentine-200 hover:bg-valentine-50 transition-colors animate-bounce"
          >
            Continue ➡️
          </motion.button>

          <p className="text-sm text-valentine-500 font-medium opacity-80 animate-pulse">
            or stay and listen for a little bit 🎵
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;