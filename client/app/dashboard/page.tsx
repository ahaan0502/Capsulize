'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { capsules as capsulesAPI } from '@/lib/api';
import { Capsule } from '@/types';

export default function Dashboard() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      return;
    }

    loadCapsules();
  }, [router]);

  const loadCapsules = async () => {
    try {
      const data = await capsulesAPI.getAll();
      setCapsules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load capsules');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading your capsules...</div>
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white transition-colors">
              My Capsules
            </h2>
            <Link
              href="/create"
              className="bg-[#9B7FBF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8A6EAE] transition text-center"
            >
              + Create New
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 transition-colors">
              {error}
            </div>
          )}

          {/* Capsules Grid */}
          {capsules.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                No capsules yet. Create your first time capsule!
              </p>
              <Link
                href="/create"
                className="inline-block bg-[#9B7FBF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#8A6EAE] transition"
              >
                Create Capsule
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {capsules.map((capsule) => (
                <Link
                  key={capsule._id}
                  href={`/capsule/${capsule._id}`}
                  className="block group"
                >
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-[#9B7FBF] dark:hover:border-[#B89FD7] hover:shadow-lg transition-all bg-white dark:bg-gray-800">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          capsule.isUnlocked
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        {capsule.isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
                      </span>
                    </div>

                    {/* Dates */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Created: {new Date(capsule.createdAt).toLocaleDateString()}
                    </p>

                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-3">
                      Unlock: {new Date(capsule.unlockDate).toLocaleDateString()}
                    </p>

                    {/* Puzzle Info */}
                    {!capsule.isUnlocked && (
                      <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Type: <span className="capitalize">{capsule.puzzle.type}</span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Difficulty: <span className="capitalize">{capsule.puzzle.difficulty}</span>
                        </p>
                      </div>
                    )}

                    {/* Attempts */}
                    {capsule.unlockAttempts > 0 && !capsule.isUnlocked && (
                      <p className="text-purple-600 dark:text-purple-400 text-sm mt-3 font-medium">
                        {capsule.unlockAttempts} attempt{capsule.unlockAttempts > 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Unlocked Date */}
                    {capsule.isUnlocked && capsule.unlockedAt && (
                      <p className="text-green-600 dark:text-green-400 text-sm mt-3">
                        Unlocked: {new Date(capsule.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}