import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Send, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { encryptLetter } from '../encrypt';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [body, setBody] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // We don't verify locally — we store the password and send it with the POST.
    // The API will reject if it's wrong.
    if (!adminPassword.trim()) {
      setAuthError('Enter your admin password');
      return;
    }
    setStoredPassword(adminPassword);
    setIsAuthed(true);
    setAuthError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Encrypt the letter content client-side
      const encryptedContent = await encryptLetter(body);

      // Send to API
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: storedPassword,
          title,
          preview,
          encryptedContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setTitle('');
      setPreview('');
      setBody('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Admin password gate ─────────────────────────────────────
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_0_rgba(236,72,153,0.1)] border border-white/80 p-8">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-400 to-indigo-400 shadow-lg shadow-violet-200/50 flex items-center justify-center">
                <Lock className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-800 text-center mb-1">Admin Access</h1>
            <p className="text-sm text-gray-400 text-center mb-6">Enter admin password to write letters</p>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none text-gray-700 text-sm transition-all"
              />
              {authError && (
                <p className="text-red-400 text-xs text-center">{authError}</p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-violet-200/40 hover:shadow-violet-300/50 transition-shadow"
              >
                Enter
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 shadow-lg shadow-emerald-200/50 mb-6"
          >
            <CheckCircle2 className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Letter Published!</h2>
          <p className="text-gray-400 text-sm mb-8">Your letter has been encrypted and saved.</p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSuccess(false)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 text-white font-semibold text-sm shadow-lg"
            >
              Write Another
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/gallery')}
              className="px-6 py-3 rounded-xl bg-white/70 border border-gray-200 text-gray-600 font-semibold text-sm shadow-sm"
            >
              View Gallery
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Letter writing form ─────────────────────────────────────
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
          className="flex items-center gap-2 text-violet-400 hover:text-violet-600 transition-colors font-medium text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to letters</span>
        </motion.button>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/75 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_0_rgba(139,92,246,0.1)] border border-white/80 overflow-hidden">
          {/* Header */}
          <div className="px-8 md:px-12 pt-8 md:pt-10 pb-6 border-b border-violet-50">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              Write a New Letter
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Content is encrypted before upload — only readable with the secret key.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 md:px-12 py-8 md:py-10 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. April 6, 2026"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none text-gray-700 text-sm transition-all"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Preview Text</label>
              <input
                type="text"
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
                placeholder="A short teaser shown in the gallery..."
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none text-gray-700 text-sm transition-all"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Letter Content</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your letter here..."
                required
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none text-gray-700 text-sm transition-all resize-none leading-relaxed"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              />
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-50 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-violet-400 to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-violet-200/40 hover:shadow-violet-300/50 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Encrypting & Uploading...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Encrypt & Publish</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
