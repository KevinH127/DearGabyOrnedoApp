import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ChevronRight, Loader2 } from 'lucide-react';
import { Letter } from '../types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
};

const LetterGallery: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/letters')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setLetters(data.letters || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-10 md:mb-14"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-400 to-fuchsia-400 shadow-lg shadow-pink-200/50 mb-6"
        >
          <Mail className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-3">
          My Letters to You
        </h1>
        <p className="text-pink-400 font-medium text-sm md:text-base max-w-md">
          I just have a lot on mind and wanted to talk to you,<br/>
          so if you see this, this is how I've been feeling.
        </p>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-pink-300 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-pink-400 font-medium text-sm">Couldn't load letters 😢</p>
      )}

      {/* Empty state */}
      {!loading && !error && letters.length === 0 && (
        <p className="text-gray-400 font-medium text-sm">No letters yet...</p>
      )}

      {/* Letter Cards */}
      {!loading && !error && letters.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-lg space-y-4"
        >
          {letters.map((letter) => (
            <motion.div
              key={letter.id}
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={`/letter/${letter.id}`} className="w-full text-left group block">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/80 shadow-[0_4px_24px_0_rgba(236,72,153,0.08)] hover:shadow-[0_8px_40px_0_rgba(236,72,153,0.15)] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-fuchsia-50 border border-pink-100/50 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-pink-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 text-base md:text-lg truncate group-hover:text-pink-600 transition-colors">
                          {letter.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-pink-300 flex-shrink-0 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {letter.preview}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LetterGallery;
