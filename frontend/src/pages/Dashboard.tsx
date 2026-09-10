import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { getDashboardScans, getDashboardStats } from '../services/api';

interface Scan {
  scanId: string;
  playerName: string;
  timestamp: string;
  overallResult: string;
  detectionCount: number;
}

interface DashboardProps {
  token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [filter, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scansResponse, statsResponse] = await Promise.all([
        getDashboardScans(filter, token),
        getDashboardStats(token),
      ]);

      setScans(scansResponse.scans || []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter(
    (scan) =>
      scan.playerName.toLowerCase().includes(search.toLowerCase()) ||
      scan.scanId.includes(search)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Scan History Dashboard</h1>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Scans</p>
              <p className="text-3xl font-bold text-white">{stats.totalScans}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm">Clean</p>
              <p className="text-3xl font-bold text-green-400">{stats.cleanScans}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">Unknown</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.unknownScans}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-400 text-sm">Suspicious</p>
              <p className="text-3xl font-bold text-orange-400">{stats.suspiciousScans}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">Cheats Detected</p>
              <p className="text-3xl font-bold text-red-400">{stats.cheatsDetected}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search player or scan ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-2">
            {['ALL', 'CLEAN', 'UNKNOWN', 'SUSPICIOUS', 'CHEAT_DETECTED'].map(
              (filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filter === filterOption
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {filterOption}
                </button>
              )
            )}
          </div>
        </div>

        {/* Scans Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading scans...</div>
        ) : (
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-cyan-500/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">
                    Scan ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">
                    Detections
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.length > 0 ? (
                  filteredScans.map((scan) => (
                    <tr
                      key={scan.scanId}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-cyan-400">
                        {scan.scanId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{scan.playerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(scan.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs ${
                            scan.overallResult === 'CLEAN'
                              ? 'bg-green-500/20 text-green-400'
                              : scan.overallResult === 'UNKNOWN'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : scan.overallResult === 'SUSPICIOUS'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {scan.overallResult}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {scan.detectionCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No scans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
