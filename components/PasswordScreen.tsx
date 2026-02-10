import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock, KeyRound, Sparkles } from 'lucide-react';
import { APP_PASSWORD, PASSWORD_HINT } from '../constants';

interface PasswordScreenProps {
  onSuccess: () => void;
}

const PasswordScreen: React.FC<PasswordScreenProps> = ({ onSuccess }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase().trim() === APP_PASSWORD.toLowerCase()) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_8px_32px_0_rgba(255,105,135,0.37)] border-4 border-white p-8 md:p-12 relative overflow-hidden">

          {/* Decorative decorative tape */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-valentine-200/50 -rotate-2 backdrop-blur-sm rounded-b-lg"></div>

          <div className="flex flex-col items-center mb-8 mt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-valentine-300 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
                className="bg-gradient-to-tr from-valentine-300 to-valentine-500 p-6 rounded-full shadow-xl relative z-10 border-4 border-white"
              >
                <Lock className="w-12 h-12 text-white" />
              </motion.div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-sans font-bold mt-8 text-valentine-800 drop-shadow-sm tracking-tight text-center">
              This Page is Locked
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-valentine-400 w-6 h-6 group-focus-within:text-valentine-500 transition-colors" />
              <motion.input
                animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter the magic word..."
                className={`w-full pl-14 pr-6 py-5 bg-white/60 border-2 rounded-3xl focus:outline-none transition-all placeholder:text-valentine-300 text-valentine-700 font-bold tracking-widest text-center text-lg ${error
                    ? 'border-red-400 focus:border-red-400 bg-red-50'
                    : 'border-valentine-100 focus:border-valentine-400 focus:bg-white focus:shadow-lg focus:shadow-valentine-100'
                  }`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-gradient-to-r from-valentine-500 to-valentine-400 hover:from-valentine-600 hover:to-valentine-500 text-white font-extrabold py-5 px-6 rounded-3xl shadow-xl shadow-valentine-500/20 transition-all flex items-center justify-center gap-3 group text-lg tracking-wide"
            >
              <span>Unlock Page</span>
              <Heart className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <div className="inline-block bg-valentine-50 border border-valentine-100 rounded-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform">
              <p className="text-xs text-valentine-400 uppercase tracking-widest font-extrabold mb-1">Secret Hint</p>
              <p className="text-sm text-valentine-600 font-medium font-sans">
                Only THE G.OAT HERSELF can unlock this page! 🤫 💕
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordScreen;