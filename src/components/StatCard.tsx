import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-3 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-[10px] uppercase tracking-wider truncate">{label}</p>
        <p className="text-white font-bold text-sm font-mono">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
