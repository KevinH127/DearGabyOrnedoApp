import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Background from './components/Background';
import PasswordScreen from './components/PasswordScreen';
import LetterGallery from './components/LetterGallery';
import LetterReader from './components/LetterReader';
import AdminPage from './components/AdminPage';

// Wraps routes that require the user to have unlocked the app
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isUnlocked = localStorage.getItem('unlocked') === 'true';
  if (!isUnlocked) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans selection:bg-pink-200 overflow-hidden relative">
        <Background />
        <div className="absolute inset-0 z-10 overflow-y-auto no-scrollbar">
          <Routes>
            <Route path="/" element={<PasswordScreen />} />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute>
                  <LetterGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/letter/:id"
              element={
                <ProtectedRoute>
                  <LetterReader />
                </ProtectedRoute>
              }
            />
            {/* Admin page — has its own password gate */}
            <Route path="/admin" element={<AdminPage />} />
            {/* Catch-all: redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Analytics />
      </div>
    </BrowserRouter>
  );
}

export default App;