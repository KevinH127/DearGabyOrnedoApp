import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Send, ArrowLeft, CheckCircle2, AlertCircle, Loader2, PenLine, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { encryptLetter } from '../encrypt';
import { decryptLetter } from '../decrypt';
import { Letter } from '../types';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Letter list state
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(false);

  // Form state
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list');
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [body, setBody] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setAuthError('Enter your admin password');
      return;
    }
    setStoredPassword(adminPassword);
    setIsAuthed(true);
    setAuthError('');
  };

  // Fetch letters after auth
  useEffect(() => {
    if (!isAuthed) return;
    setLoadingLetters(true);
    fetch('/api/letters')
      .then((res) => res.json())
      .then((data) => setLetters(data.letters || []))
      .catch(() => {})
      .finally(() => setLoadingLetters(false));
  }, [isAuthed, success]);

  const handleEdit = async (letter: Letter) => {
    setEditingLetter(letter);
    setTitle(letter.title);
    setPreview(letter.preview);
    setBody('');
    setError('');
    setMode('edit');

    // Fetch and decrypt existing content
    try {
      const res = await fetch(letter.url);
      const encrypted = await res.text();
      const decrypted = await decryptLetter(encrypted);
      setBody(decrypted);
    } catch {
      setError('Could not load letter content for editing');
    }
  };

  const handleNew = () => {
    setEditingLetter(null);
    setTitle('');
    setPreview('');
    setBody('');
    setError('');
    setMode('new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const encryptedContent = await encryptLetter(body);

      if (mode === 'new') {
        const res = await fetch('/api/letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: storedPassword, title, preview, encryptedContent }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }
      } else if (mode === 'edit' && editingLetter) {
        const res = await fetch('/api/letters', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: storedPassword,
            id: editingLetter.id,
            title,
            preview,
            encryptedContent,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Update failed');
        }
      }

      setSuccess(true);
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
            <p className="text-sm text-gray-400 text-center mb-6">Enter admin password to manage letters</p>

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'edit' ? 'Letter Updated!' : 'Letter Published!'}
          </h2>
          <p className="text-gray-400 text-sm mb-8">Your letter has been encrypted and saved.</p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSuccess(false); setMode('list'); }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 text-white font-semibold text-sm shadow-lg"
            >
              Back to Letters
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

  // ─── Letter list (default view after auth) ───────────────────
  if (mode === 'list') {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                Manage Letters
              </h1>
              <p className="text-sm text-gray-400 mt-1">{letters.length} letter(s)</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-violet-200/40"
            >
              <Plus className="w-4 h-4" />
              <span>New Letter</span>
            </motion.button>
          </div>

          {loadingLetters && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-300 animate-spin" />
            </div>
          )}

          <div className="space-y-3">
            {letters.map((letter) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/80 shadow-[0_4px_24px_0_rgba(139,92,246,0.08)] flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-base truncate">{letter.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{letter.preview}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(letter)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 text-violet-500 font-semibold text-sm hover:bg-violet-100 transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Letter writing / editing form ───────────────────────────
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
          onClick={() => setMode('list')}
          className="flex items-center gap-2 text-violet-400 hover:text-violet-600 transition-colors font-medium text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to letter list</span>
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
              {mode === 'edit' ? 'Edit Letter' : 'Write a New Letter'}
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
                  <span>{mode === 'edit' ? 'Updating...' : 'Encrypting & Uploading...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{mode === 'edit' ? 'Update Letter' : 'Encrypt & Publish'}</span>
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
