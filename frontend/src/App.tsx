import React, { useState } from 'react';
import CheckPage from './pages/CheckPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'check' | 'dashboard'>('check');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentPage('check');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-cyan-500/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              SA-MP CHECKER
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage('check')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'check'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Scan
              </button>
              {token && (
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>

          {token && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'check' ? (
          <CheckPage />
        ) : token ? (
          <Dashboard token={token} />
        ) : (
          <CheckPage />
        )}
      </main>
    </div>
  );
}

export default App;
