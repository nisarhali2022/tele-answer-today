'use client';

import { useState, useEffect } from 'react';
import { getKarachiDateLabel } from '@/lib/date';

const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], answer: '' };

const DEFAULT_QUESTIONS = Array.from({ length: 5 }, () => ({
  ...EMPTY_QUESTION,
  options: ['', '', '', ''],
}));

export default function AdminQuizPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setAuthed(Boolean(data.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  // Load existing quiz after the server confirms the session.
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch('/api/quiz', { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          setAuthed(false);
          throw new Error('Your admin session has expired.');
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Unable to load the current quiz.');
        }
        return data;
      })
      .then((data) => {
        if (data?.questions?.length) {
          setQuestions(data.questions);
        }
      })
      .catch((error) => setAuthMessage(error.message))
      .finally(() => setLoading(false));
  }, [authed]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!secret.trim()) return;

    setAuthLoading(true);
    setAuthMessage('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(data.message || 'Login failed.');
        return;
      }

      setSecret('');
      setAuthed(true);
    } catch {
      setAuthMessage('Unable to contact the server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
    setAuthed(false);
    setQuestions(DEFAULT_QUESTIONS);
    setMessage(null);
  };

  const updateQuestion = (qi, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) }
          : q
      )
    );
  };

  const setAnswer = (qi, option) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, answer: option } : q))
    );
  };

  const handleSave = async () => {
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setMessage({ type: 'error', text: `Question ${i + 1} is empty.` });
        return;
      }
      if (!q.answer.trim()) {
        setMessage({ type: 'error', text: `Question ${i + 1} has no answer selected.` });
        return;
      }
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Quiz saved for ${getKarachiDateLabel()}!` });
      } else if (res.status === 401) {
        setAuthed(false);
        setMessage(null);
        setAuthMessage('Your admin session has expired. Please log in again.');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all questions? This will erase all unsaved data.')) {
      setQuestions(DEFAULT_QUESTIONS);
      setMessage(null);
    }
  };

  if (authed === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-sm text-text-secondary">Checking admin session...</p>
      </div>
    );
  }

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 border border-border">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="font-heading font-bold text-xl text-text-primary mt-2">
              Admin Panel
            </h1>
            <p className="text-text-secondary text-sm mt-1">Enter your admin secret to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin secret key"
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {authMessage && (
              <p className="text-sm text-red-600" role="alert">
                {authMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-[#2a5298] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Checking...' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Panel ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <h1 className="font-heading font-bold text-lg">Quiz Admin Panel</h1>
          <p className="text-blue-200 text-xs mt-0.5">
            Karachi date: {getKarachiDateLabel()}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-blue-200 hover:text-white transition-colors border border-blue-300 px-3 py-1.5 rounded"
        >
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Questions */}
        {loading ? (
          <div className="text-center py-10 text-text-secondary">Loading existing quiz…</div>
        ) : (
          <div className="space-y-5">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
              >
                {/* Question header */}
                <div className="bg-primary px-5 py-3 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {qi + 1}
                  </span>
                  <span className="text-white text-sm font-semibold">Question {qi + 1}</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Question text */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                      placeholder={`e.g. H2O is commonly known as ____?`}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                      Options — click ✓ to mark as correct answer
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => {
                        const isAnswer =
                          opt.trim() !== '' &&
                          opt.toLowerCase().trim() === q.answer.toLowerCase().trim();
                        return (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => opt.trim() && setAnswer(qi, opt.trim())}
                              title="Mark as correct answer"
                              className={`flex-shrink-0 w-7 h-7 rounded-full border-2 text-xs font-bold transition-colors ${
                                isAnswer
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-border text-text-secondary hover:border-green-400'
                              }`}
                            >
                              {isAnswer ? '✓' : String.fromCharCode(65 + oi)}
                            </button>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                updateOption(qi, oi, e.target.value);
                                // Keep answer in sync if this was the answer
                                if (isAnswer) setAnswer(qi, e.target.value);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                                isAnswer ? 'border-green-400 bg-green-50' : 'border-border'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Answer preview */}
                  {q.answer && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <span className="text-green-800 text-xs font-bold">👉 Answer:</span>
                      <span className="text-green-800 text-sm font-bold">{q.answer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`mt-6 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-300'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {saving ? 'Saving…' : '💾 Save Quiz for Today'}
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold"
          >
            🗑️ Clear All
          </button>
        </div>

        <p className="mt-4 text-xs text-text-secondary text-center">
          Saving invalidates the quiz cache so the homepage can refresh with
          the latest answers.
        </p>
      </div>
    </div>
  );
}
