import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SensorReading } from '../hooks/useSerialSensor';

interface LiveChartProps {
  data: SensorReading[];
  dataKey: 'temperature' | 'humidity';
  color: string;
  gradientId: string;
  label: string;
  unit: string;
  referenceLine?: number;
  referenceLabel?: string;
}

const LiveChart: React.FC<LiveChartProps> = ({
  data,
  dataKey,
  color,
  gradientId,
  label,
  unit,
  referenceLine,
  referenceLabel,
}) => {
  const formattedData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full opacity-50"
              style={{ backgroundColor: color }}
            />
            {label}
          </h3>
          <span className="text-slate-500 text-sm">Waiting for data...</span>
        </div>
        <div className="h-[200px] md:h-[250px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">Connect to your Arduino to see live data</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label: tooltipLabel }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-slate-400 text-xs">{tooltipLabel}</p>
          <p className="text-white font-bold text-sm">
            {payload[0].value.toFixed(1)} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
          {label}
        </h3>
        <span className="text-slate-400 text-sm">Live • 2s interval</span>
      </div>
      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              tickCount={6}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              domain={[0, 'auto']}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {referenceLine !== undefined && (
              <ReferenceLine
                y={referenceLine}
                stroke="#ef4444"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{
                  value: referenceLabel || '',
                  position: 'right',
                  fill: '#ef4444',
                  fontSize: 12,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LiveChart;
