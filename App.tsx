import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { AppState } from './types';
import PasswordScreen from './components/PasswordScreen';
import Slideshow from './components/Slideshow';
import TransitionScreen from './components/TransitionScreen';
import QuestionScreen from './components/QuestionScreen';
import SuccessScreen from './components/SuccessScreen';
import LetterScreen from './components/LetterScreen';
import DatePlanner from './components/DatePlanner';
import Background from './components/Background';
import MusicPlayer from './components/MusicPlayer';
import LoadingScreen from './components/LoadingScreen';
import { MUSIC_CALM_ID, MUSIC_YOUTUBE_ID, MUSIC_YOUTUBE_START_TIME, MUSIC_VOLUME, SHOW_LOADING_SCREEN } from './constants';

function App() {
  if (SHOW_LOADING_SCREEN) {
    return <LoadingScreen />;
  }

  const [screen, setScreen] = useState<AppState>(AppState.PASSWORD);
  const [playMusic, setPlayMusic] = useState(true);
  const [currentMusicId, setCurrentMusicId] = useState(MUSIC_CALM_ID);
  const [forcePlayTrigger, setForcePlayTrigger] = useState(0);

  const handlePasswordSuccess = () => {
    // Start music only after user interaction (password entry)
    setPlayMusic(true);
    setForcePlayTrigger(prev => prev + 1); // Force play attempt
    setScreen(AppState.SLIDESHOW);
  };

  const handleSlideshowComplete = () => {
    setScreen(AppState.TRANSITION);
  };

  const handleTransitionComplete = () => {
    setScreen(AppState.QUESTION);
  };

  const handleProposalYes = () => {
    setCurrentMusicId(MUSIC_YOUTUBE_ID);
    setForcePlayTrigger(prev => prev + 1); // Force play attempt
    setScreen(AppState.SUCCESS);
  };

  const handlePlanDate = () => {
    setScreen(AppState.PLANNER);
    setCurrentMusicId(MUSIC_CALM_ID);
    setForcePlayTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-valentine-200 overflow-hidden relative">

      {/* Global Background */}
      <Background />

      {/* Global Music Player */}
      <MusicPlayer
        shouldPlay={playMusic}
        videoId={currentMusicId}
        volume={MUSIC_VOLUME}
        startTime={currentMusicId === MUSIC_YOUTUBE_ID ? MUSIC_YOUTUBE_START_TIME : 0}
        forcePlayTrigger={forcePlayTrigger}
      />

      <AnimatePresence mode="wait">
        {screen === AppState.PASSWORD && (
          <motion.div
            key="password"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <PasswordScreen onSuccess={handlePasswordSuccess} />
          </motion.div>
        )}

        {screen === AppState.SLIDESHOW && (
          <motion.div
            key="slideshow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <Slideshow onComplete={handleSlideshowComplete} />
          </motion.div>
        )}

        {screen === AppState.TRANSITION && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50"
          >
            <TransitionScreen onComplete={handleTransitionComplete} />
          </motion.div>
        )}

        {screen === AppState.QUESTION && (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <QuestionScreen onYes={handleProposalYes} />
          </motion.div>
        )}

        {screen === AppState.SUCCESS && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute inset-0 z-10"
          >
            <SuccessScreen onContinue={() => setScreen(AppState.LETTER)} />
          </motion.div>
        )}

        {screen === AppState.LETTER && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute inset-0 z-10"
          >
            <LetterScreen onPlanDate={handlePlanDate} />
          </motion.div>
        )}

        {screen === AppState.PLANNER && (
          <motion.div
            key="planner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 flex items-center justify-center p-4 relative"
          >
            <DatePlanner onComplete={() => { }} />
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  );
}

export default App;