import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  label: string;
  progress: number;
  threshold: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, progress, threshold }) => {
  const isComplete = progress >= threshold;

  return (
    <div className="flex items-center gap-3">
      {isComplete ? (
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-cyan-500/50 flex-shrink-0" />
      )}
      <span className={`text-sm ${isComplete ? 'text-gray-300' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
};

export default ProgressBar;
