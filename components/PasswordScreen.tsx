import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, Sparkles } from 'lucide-react';
import { APP_PASSWORD } from '../constants';

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
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_0_rgba(236,72,153,0.15)] border border-white/80 p-8 md:p-12 relative overflow-hidden">

          {/* Decorative accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-pink-300 to-fuchsia-300 rounded-b-full"></div>

          <div className="flex flex-col items-center mb-8 mt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-300 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6, repeatDelay: 3 }}
                className="bg-gradient-to-tr from-pink-400 to-fuchsia-400 p-5 rounded-2xl shadow-xl shadow-pink-200/50 relative z-10 border-2 border-white/50"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-8 text-gray-800 tracking-tight text-center">
              This page is locked
            </h2>
            <p className="text-sm text-pink-400 mt-2 font-medium">
              Only you know the passwword
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 w-5 h-5 group-focus-within:text-pink-500 transition-colors" />
              <motion.input
                animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter password..."
                className={`w-full pl-12 pr-6 py-4 bg-white/60 border-2 rounded-2xl focus:outline-none transition-all placeholder:text-pink-200 text-gray-700 font-semibold tracking-widest text-center text-base ${error
                    ? 'border-red-300 focus:border-red-400 bg-red-50/50'
                    : 'border-pink-100 focus:border-pink-400 focus:bg-white focus:shadow-lg focus:shadow-pink-100/50'
                  }`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 group text-base tracking-wide"
            >
              <span>Unlock</span>
              <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-pink-300 font-medium">
              Hi, if you don't know the password, text me lol jk
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordScreen;