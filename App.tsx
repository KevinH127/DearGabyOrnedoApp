import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppState, Letter } from './types';
import PasswordScreen from './components/PasswordScreen';
import LetterGallery from './components/LetterGallery';
import LetterReader from './components/LetterReader';
import Background from './components/Background';

function App() {
  const isUnlocked = typeof window !== 'undefined' && localStorage.getItem('unlocked') === 'true';
  const [screen, setScreen] = useState<AppState>(isUnlocked ? AppState.GALLERY : AppState.PASSWORD);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const handlePasswordSuccess = () => {
    localStorage.setItem('unlocked', 'true');
    setScreen(AppState.GALLERY);
  };

  const handleSelectLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setScreen(AppState.READING);
  };

  const handleBackToGallery = () => {
    setScreen(AppState.GALLERY);
    setSelectedLetter(null);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-pink-200 overflow-hidden relative">
      {/* Global Background */}
      <Background />

      <AnimatePresence mode="wait">
        {screen === AppState.PASSWORD && (
          <motion.div
            key="password"
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10"
          >
            <PasswordScreen onSuccess={handlePasswordSuccess} />
          </motion.div>
        )}

        {screen === AppState.GALLERY && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10 overflow-y-auto no-scrollbar"
          >
            <LetterGallery onSelectLetter={handleSelectLetter} />
          </motion.div>
        )}

        {screen === AppState.READING && selectedLetter && (
          <motion.div
            key={`letter-${selectedLetter.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 overflow-y-auto no-scrollbar"
          >
            <LetterReader letter={selectedLetter} onBack={handleBackToGallery} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;