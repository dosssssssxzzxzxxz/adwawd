import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ResultsDisplay from '../components/ResultsDisplay';
import { startCheck, getCheckStatus } from '../services/api';

const CheckPage: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);
  const [helperConnected, setHelperConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHelperStatus();
    const interval = setInterval(checkHelperStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkHelperStatus = async () => {
    try {
      const response = await fetch('http://localhost:9999/status', {
        mode: 'no-cors',
      });
      setHelperConnected(response.ok);
    } catch {
      setHelperConnected(false);
    }
  };

  const handleStartCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsScanning(true);
    setStatus('running');
    setError(null);
    setProgress(0);

    try {
      const response = await startCheck({
        playerName: playerName.trim(),
        helperAvailable: helperConnected,
      });

      setScanId(response.scanId);

      const pollInterval = setInterval(async () => {
        try {
          const checkResponse = await getCheckStatus(response.scanId);
          setProgress(checkResponse.progress);

          if (checkResponse.complete) {
            clearInterval(pollInterval);
            setResults(checkResponse.results);
            setStatus('complete');
            setIsScanning(false);
          }
        } catch (err) {
          clearInterval(pollInterval);
        }
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Scan failed');
      setStatus('error');
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            SA-MP PC CHECKER
          </h1>
          <p className="text-gray-400 text-lg">
            Check your GTA:SA installation before joining
          </p>
        </div>

        {/* Helper Status */}
        {!isScanning && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              helperConnected
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {helperConnected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">
                    Helper connected — Full system scan available
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400">
                    Helper not detected — Browser-only scan mode
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scan Form */}
        {!isScanning && status === 'idle' && (
          <form
            onSubmit={handleStartCheck}
            className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 mb-8"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SA-MP Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your player name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                maxLength={24}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              START PC CHECK
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              No installation required. Browser-based scanning with optional Windows helper.
            </p>
          </form>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400 animate-spin" />
              Scanning System
            </h2>

            <div className="space-y-3 mb-8">
              <ProgressBar label="Connecting to server" progress={progress} threshold={10} />
              <ProgressBar
                label="Identifying GTA installation"
                progress={progress}
                threshold={20}
              />
              <ProgressBar label="Checking ASI files" progress={progress} threshold={35} />
              <ProgressBar label="Scanning MoonLoader" progress={progress} threshold={50} />
              <ProgressBar label="Scanning CLEO" progress={progress} threshold={60} />
              <ProgressBar label="Inspecting loaded modules" progress={progress} threshold={75} />
              <ProgressBar label="Checking hidden files" progress={progress} threshold={85} />
              <ProgressBar label="Scanning processes" progress={progress} threshold={95} />
              <ProgressBar label="Generating report" progress={progress} threshold={100} />
            </div>

            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-gray-400 mt-4 text-sm">{progress}% Complete</p>
          </div>
        )}

        {/* Results */}
        {status === 'complete' && results && (
          <ResultsDisplay results={results} playerName={playerName} scanId={scanId} />
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
            <h3 className="text-red-400 font-bold mb-2">Scan Failed</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={() => {
                setStatus('idle');
                setScanId(null);
                setError(null);
                setPlayerName('');
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckPage;
