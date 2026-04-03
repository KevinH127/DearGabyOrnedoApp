import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { Letter } from '../types';

interface LetterReaderProps {
  letter: Letter;
  onBack: () => void;
}

const LetterReader: React.FC<LetterReaderProps> = ({ letter, onBack }) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setContent(null);
    setError(false);
    fetch(`/letters/${letter.file}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.text();
      })
      .then((text) => setContent(text))
      .catch(() => setError(true));
  }, [letter.file]);

  const paragraphs = content ? content.split('\n\n') : [];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12 overflow-y-auto">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mb-6"
      >
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="flex items-center gap-2 text-pink-400 hover:text-pink-600 transition-colors font-medium text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to letters</span>
        </motion.button>
      </motion.div>

      {/* Letter card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/75 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_0_rgba(236,72,153,0.1)] border border-white/80 overflow-hidden">
          {/* Letter header */}
          <div className="px-8 md:px-12 pt-8 md:pt-10 pb-6 border-b border-pink-50">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                {letter.title}
              </h1>
            </motion.div>
          </div>

          {/* Letter content */}
          <div className="px-8 md:px-12 py-8 md:py-10">
            {content === null && !error && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-pink-300 animate-spin" />
              </div>
            )}

            {error && (
              <p className="text-center text-pink-400 py-8">
                Couldn't load this letter 😢
              </p>
            )}

            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className="text-gray-600 leading-relaxed text-base md:text-lg mb-5 last:mb-0 font-normal"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {paragraph.split('\\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LetterReader;
