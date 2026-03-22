import React from 'react';
import { motion } from 'motion/react';
import { Clock, Zap } from 'lucide-react';

interface Props {
  extractionTimeSeconds: number;
}

export const TimeSavedCard: React.FC<Props> = ({ extractionTimeSeconds }) => {
  const manualEntryMinutes = 8;
  const manualEntrySeconds = manualEntryMinutes * 60;
  const savedSeconds = manualEntrySeconds - extractionTimeSeconds;
  
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50 border border-emerald-100 p-6 rounded-[24px] flex items-center gap-6"
    >
      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
        <Zap size={24} fill="currentColor" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-emerald-700 font-bold uppercase tracking-widest text-[10px] mb-1">
          <Clock size={12} /> Efficiency Report
        </div>
        <p className="text-emerald-900 font-medium leading-relaxed">
          Extracted in <span className="font-bold">{extractionTimeSeconds.toFixed(1)}s</span> · 
          Manual entry estimate: <span className="font-bold">{manualEntryMinutes} minutes</span> · 
          Time saved: <span className="font-bold text-emerald-600">{formatTime(savedSeconds)}</span>
        </p>
      </div>
    </motion.div>
  );
};
