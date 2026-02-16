'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { capsules as capsulesAPI } from '@/lib/api';
import { Capsule } from '@/types';

export default function CapsulePage() {
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [hint, setHint] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadCapsule();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const loadCapsule = async () => {
    try {
      const data = await capsulesAPI.getOne(id);
      setCapsule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load capsule');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setHint('');
    setUnlocking(true);

    try {
      const result = await capsulesAPI.unlock(id, answer);
      
      if (result.success) {
        setUnlockSuccess(true);
        // Reload capsule to get updated data with content
        await loadCapsule();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlock';
      setUnlockError(errorMessage);
      
      // Try to extract hint from error response if available
      // This depends on your API error structure
      if (err instanceof Error && err.message.includes('hint')) {
        const hintMatch = err.message.match(/hint: (.+)/);
        if (hintMatch) {
          setHint(hintMatch[1]);
        }
      }
    } finally {
      setUnlocking(false);
    }
  };

  const canUnlock = () => {
    if (!capsule) return false;
    const unlockDate = new Date(capsule.unlockDate);
    const now = new Date();
    return now >= unlockDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading capsule...</div>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Capsule not found'}</p>
          <Link
            href="/dashboard"
            className="text-[#9B7FBF] dark:text-[#B89FD7] hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-[#9B7FBF] text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Time Capsule</h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard"
                className="hover:text-purple-200 transition font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/create"
                className="hover:text-purple-200 transition font-medium"
              >
                Create Capsule
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-purple-200 transition font-medium"
              >
                Logout
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed top-0 right-0 h-full w-64 bg-[#9B7FBF] text-white shadow-2xl z-50 md:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="block py-3 hover:bg-white/10 rounded-lg px-4 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="block py-3 hover:bg-white/10 rounded-lg px-4 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Capsule
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 hover:bg-white/10 rounded-lg px-4 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-[#9B7FBF] dark:text-[#B89FD7] hover:underline transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Capsule Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                Time Capsule
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  capsule.isUnlocked
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                }`}
              >
                {capsule.isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
              </span>
            </div>

            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Created:</span>{' '}
                {new Date(capsule.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p>
                <span className="font-medium">Unlock Date:</span>{' '}
                {new Date(capsule.unlockDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {capsule.isUnlocked && capsule.unlockedAt && (
                <p>
                  <span className="font-medium">Unlocked:</span>{' '}
                  {new Date(capsule.unlockedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
              {!capsule.isUnlocked && capsule.unlockAttempts > 0 && (
                <p>
                  <span className="font-medium">Unlock Attempts:</span> {capsule.unlockAttempts}
                </p>
              )}
            </div>
          </div>

          {/* Unlocked Content */}
          {capsule.isUnlocked && capsule.content && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 md:p-8 mb-6 transition-colors">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">
                Your Message from the Past
              </h3>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {capsule.content}
              </p>
            </div>
          )}

          {/* Locked - Show Puzzle */}
          {!capsule.isUnlocked && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 transition-colors">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Solve the Puzzle to Unlock
              </h3>

              {/* Can't unlock yet */}
              {!canUnlock() && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-400">
                    ⏳ This capsule can&apos;t be unlocked yet. Come back on{' '}
                    {new Date(capsule.unlockDate).toLocaleDateString()}.
                  </p>
                </div>
              )}

              {/* Puzzle Info */}
              <div className="mb-6 space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span>{' '}
                  <span className="capitalize">{capsule.puzzle.type}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Difficulty:</span>{' '}
                  <span className="capitalize">{capsule.puzzle.difficulty}</span>
                </p>
              </div>

              {/* The Puzzle Question */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">
                  Puzzle:
                </h4>
                <p className="text-gray-800 dark:text-gray-200 text-lg">
                  {capsule.puzzle.question}
                </p>
              </div>

              {/* Hints */}
              {capsule.puzzle.hints && capsule.puzzle.hints.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Hints:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {capsule.puzzle.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unlock Form */}
              {canUnlock() && (
                <form onSubmit={handleUnlock} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Your Answer
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      required
                      rows={4}
                      disabled={unlocking}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#9B7FBF] dark:focus:border-[#B89FD7] focus:outline-none transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none disabled:opacity-50"
                      placeholder="Enter your answer here..."
                    />
                  </div>

                  {unlockError && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
                      {unlockError}
                      {hint && (
                        <p className="mt-2 text-sm">
                          <span className="font-medium">Hint:</span> {hint}
                        </p>
                      )}
                    </div>
                  )}

                  {unlockSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg">
                      🎉 Capsule unlocked! Scroll up to see your message.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={unlocking}
                    className="w-full bg-[#9B7FBF] text-white py-3 rounded-lg font-semibold hover:bg-[#8A6EAE] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unlocking ? 'Unlocking...' : 'Unlock Capsule'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}