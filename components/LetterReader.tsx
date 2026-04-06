import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { LETTERS } from '../constants';
import { decryptLetter } from '../decrypt';

const LetterReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentIndex = LETTERS.findIndex((l) => l.id === Number(id));
  const letter = currentIndex !== -1 ? LETTERS[currentIndex] : undefined;
  const nextLetter = currentIndex < LETTERS.length - 1 ? LETTERS[currentIndex + 1] : null;

  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!letter) return;
    setContent(null);
    setError(false);
    fetch(`/letters/${letter.file}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.text();
      })
      .then((text) => decryptLetter(text))
      .then((decrypted) => setContent(decrypted))
      .catch(() => setError(true));
  }, [letter]);

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pink-400 font-medium">Letter not found.</p>
      </div>
    );
  }

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
          onClick={() => navigate('/gallery')}
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

          {/* Next letter button */}
          {nextLetter && content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-8 md:px-12 pb-8 md:pb-10 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/letter/${nextLetter.id}`)}
                className="ml-auto flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-fuchsia-400 text-white font-semibold text-sm shadow-lg shadow-pink-200/40 hover:shadow-pink-300/50 transition-shadow duration-300 group"
              >
                <span>Next Letter</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LetterReader;
