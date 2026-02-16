'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation - Single component, responsive with breakpoints */}
      <nav className="bg-[#9B7FBF] text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Capsulize</h1>
            
            {/* Desktop Navigation - hidden on mobile, visible md+ */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/login"
                className="hover:text-purple-200 transition font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="bg-white text-[#9B7FBF] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Register
              </Link>
              
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

            {/* Mobile Controls - visible on mobile, hidden md+ */}
            <div className="flex md:hidden items-center gap-4">
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

              {/* Hamburger Menu */}
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

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Panel */}
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
                  href="/login"
                  className="block py-3 hover:bg-white/10 rounded-lg px-4 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-3 hover:bg-white/10 rounded-lg px-4 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
            Capsulize
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300 transition-colors">
            An interactive, AI powered journal
          </p>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-12 text-gray-600 dark:text-gray-400 transition-colors">
            Create AI-powered time capsules that can only be unlocked by proving 
            you&apos;ve grown. Each capsule generates a personalized puzzle that tests 
            your knowledge, memory, or personal development.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-[#9B7FBF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#8A6EAE] transition text-center"
            >
              Get Started
            </Link>
            <Link 
              href="/login"
              className="bg-white dark:bg-gray-800 text-[#9B7FBF] dark:text-[#B89FD7] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border-2 border-[#9B7FBF] dark:border-[#B89FD7] text-center"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 transition-colors">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              AI-Powered Puzzles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every capsule generates a unique puzzle based on your content, 
              testing your growth and knowledge.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 transition-colors">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Unlock Your Past
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set a future date and solve personalized challenges to prove 
              you&apos;ve evolved since writing.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 transition-colors sm:col-span-2 md:col-span-1">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Track Your Growth
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Reflect on how far you&apos;ve come by unlocking memories of your 
              past self.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 mt-16 transition-colors">
        <p className="text-sm md:text-base">© 2026 Capsulize.</p>
      </footer>
    </div>
  );
}