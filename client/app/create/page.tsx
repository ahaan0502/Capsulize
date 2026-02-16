'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { capsules as capsulesAPI } from '@/lib/api';

export default function CreateCapsule() {
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

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
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (content.trim().length < 20) {
      setError('Content must be at least 20 characters');
      return;
    }

    const selectedDate = new Date(unlockDate);
    const now = new Date();

    if (selectedDate <= now) {
      setError('Unlock date must be in the future');
      return;
    }

    setLoading(true);

    try {
      await capsulesAPI.create(content, unlockDate);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create capsule');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-[#9B7FBF] text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Capsulize</h1>
            
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
              
              {/* Dark Mode Toggle */}
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

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8 transition-colors">
            Create Time Capsule
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 transition-colors">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Field */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors">
                Your Message
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Write about your current thoughts, experiences, or goals.
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#9B7FBF] dark:focus:border-[#B89FD7] focus:outline-none transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                placeholder="What's on your mind?"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {content.length} characters (minimum 20)
              </p>
            </div>

            {/* Unlock Date Field */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors">
                Unlock Date
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                When would you like to unlock this capsule?
              </p>
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={getMinDate()}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#9B7FBF] dark:focus:border-[#B89FD7] focus:outline-none transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                🧠 AI-Powered Puzzle
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-400">
                Based on your message, we&apos;ll generate a personalized puzzle that tests your growth, 
                knowledge, or personal development. Only by solving it can you unlock your past thoughts.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#9B7FBF] text-white py-3 rounded-lg font-semibold hover:bg-[#8A6EAE] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Capsule'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}