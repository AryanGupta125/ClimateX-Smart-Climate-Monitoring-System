import React from 'react';

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
  activeColor: string;
  inactiveColor?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  label,
  value,
  active,
  activeColor,
  inactiveColor = 'text-slate-500',
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
          active ? 'shadow-lg' : ''
        }`}
        style={{
          backgroundColor: active ? `${activeColor}20` : '#1e293b',
          boxShadow: active ? `0 0 20px ${activeColor}30` : 'none',
        }}
      >
        <span className={active ? '' : inactiveColor} style={{ color: active ? activeColor : undefined }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
        <p
          className="font-bold text-lg transition-colors duration-300"
          style={{ color: active ? activeColor : '#64748b' }}
        >
          {value}
        </p>
      </div>
      <div className="ml-auto">
        <span
          className="w-3 h-3 rounded-full block transition-all duration-500"
          style={{
            backgroundColor: active ? activeColor : '#475569',
            boxShadow: active ? `0 0 10px ${activeColor}` : 'none',
          }}
        />
      </div>
    </div>
  );
};

export default StatusCard;
