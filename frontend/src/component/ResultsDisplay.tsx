import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';

interface ResultsDisplayProps {
  results: any;
  playerName: string;
  scanId: string | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, playerName, scanId }) => {
  const severity = results.overallResult;
  const severityColor = {
    CLEAN: 'text-green-400',
    UNKNOWN: 'text-yellow-400',
    SUSPICIOUS: 'text-orange-400',
    CHEAT_DETECTED: 'text-red-400',
  }[severity] || 'text-gray-400';

  const severityIcon = {
    CLEAN: <CheckCircle className="w-12 h-12 text-green-400" />,
    UNKNOWN: <AlertCircle className="w-12 h-12 text-yellow-400" />,
    SUSPICIOUS: <AlertCircle className="w-12 h-12 text-orange-400" />,
    CHEAT_DETECTED: <XCircle className="w-12 h-12 text-red-400" />,
  }[severity];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8">
      {/* Summary */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">{severityIcon}</div>
        <h2 className="text-3xl font-bold text-white mb-2">Scan Complete</h2>
        <p className={`text-2xl font-bold ${severityColor}`}>
          {severity === 'CLEAN' && '✓ PASSED'}
          {severity === 'UNKNOWN' && '⚠️ REVIEW REQUIRED'}
          {severity === 'SUSPICIOUS' && '⚠️ SUSPICIOUS ACTIVITY'}
          {severity === 'CHEAT_DETECTED' && '✗ CHEAT DETECTED'}
        </p>
        <p className="text-gray-400 mt-2">
          Scan ID: <code className="text-cyan-400">{scanId}</code>
        </p>
      </div>

      {/* Detections */}
      {results.detections && results.detections.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🔴 Detections</h3>
          <div className="space-y-4">
            {results.detections.map((det: any, idx: number) => (
              <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-bold">
                  {det.type.toUpperCase()}: {det.name}
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Path: <code className="text-cyan-300">{det.path}</code>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  SHA-256: <code>{det.hash.substring(0, 16)}...</code>
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Severity: <span className="text-red-400 font-bold">{det.severity}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suspicious Modules */}
      {results.suspiciousModules && results.suspiciousModules.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🧩 Loaded Modules</h3>
          <div className="space-y-3">
            {results.suspiciousModules.map((mod: any, idx: number) => (
              <div key={idx} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <p className="text-orange-400 font-bold">{mod.name}</p>
                <p className="text-gray-400 text-sm">
                  Status: <span className="text-orange-300">{mod.status}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  GTA Interaction:{' '}
                  <span
                    className={
                      mod.gtaInteraction === 'DETECTED' ? 'text-red-400' : 'text-gray-300'
                    }
                  >
                    {mod.gtaInteraction}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Files */}
      {results.hiddenFiles && results.hiddenFiles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            <Eye className="inline mr-2 w-5 h-5" />
            Hidden Files
          </h3>
          <div className="space-y-3">
            {results.hiddenFiles.map((file: any, idx: number) => (
              <div key={idx} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 font-bold">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  Classification: <span className="text-yellow-300">{file.classification}</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Attributes: {file.attributes.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cosmetic Mods */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-bold text-green-400 mb-3">✅ Cosmetic Modifications (Ignored)</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
          <div>🎨 Skins</div>
          <div>✓ Ignored</div>
          <div>🖼️ Textures</div>
          <div>✓ Ignored</div>
          <div>🌅 Timecyc</div>
          <div>✓ Ignored</div>
          <div>🚗 Vehicle Models</div>
          <div>✓ Ignored</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">ASI Files</p>
          <p className="text-2xl font-bold text-white">{results.asiCount || 0}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">MoonLoader</p>
          <p className="text-2xl font-bold text-white">{results.moonloaderCount || 0}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">CLEO Scripts</p>
          <p className="text-2xl font-bold text-white">{results.cleoCount || 0}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">Loaded Modules</p>
          <p className="text-2xl font-bold text-white">{results.loadedModules || 0}</p>
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm">
        Results have been sent to the server for review.
      </p>
    </div>
  );
};

export default ResultsDisplay;
