import React, { useRef, useEffect } from 'react';
import { SensorReading } from '../hooks/useSerialSensor';

interface SerialMonitorProps {
  history: SensorReading[];
  rawLogs: string[];
  serialConnected: boolean;
  alarmState: boolean;
}

const SerialMonitor: React.FC<SerialMonitorProps> = ({ history, rawLogs, serialConnected, alarmState }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rawLogs, history]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <span className="text-green-400">{'>'}_</span>
          Serial Monitor
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: serialConnected ? '#22c55e' : '#64748b',
              boxShadow: serialConnected ? '0 0 6px #22c55e' : 'none',
            }}
          />
          <span className="text-xs text-slate-500 font-mono">
            {serialConnected ? 'COM • 115200' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="bg-[#0a0f1a] rounded-lg p-3 h-[200px] overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
      >
        {!serialConnected && rawLogs.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            <p>Connect to Arduino to see serial output</p>
            <p className="text-slate-600 mt-1">COM port • 115200 baud</p>
          </div>
        ) : (
          <>
            {rawLogs.map((log, i) => {
              let colorClass = 'text-slate-300';
              if (log.includes('---')) colorClass = 'text-green-400';
              else if (log.includes('Baud') || log.includes('Waiting')) colorClass = 'text-cyan-400';
              else if (log.includes('Temperature')) colorClass = 'text-slate-300';
              else if (log.includes('Failed') || log.includes('Error')) colorClass = 'text-red-400';
              else if (log.includes('BLE')) colorClass = 'text-blue-400';
              
              // Highlight temperature values
              const parts = log.split(/(Temperature\s*:\s*[\d.]+|Humidity\s*:\s*[\d.]+)/gi);
              
              return (
                <div key={i} className={colorClass}>
                  {parts.map((part, j) => {
                    if (/Temperature\s*:\s*([\d.]+)/i.test(part)) {
                      const match = part.match(/([\d.]+)/);
                      const temp = match ? parseFloat(match[1]) : 0;
                      return (
                        <span key={j}>
                          <span className="text-cyan-300">Temperature : </span>
                          <span className={temp >= 31 ? 'text-red-400 font-bold' : 'text-green-300'}>
                            {match?.[1]}
                          </span>
                        </span>
                      );
                    } else if (/Humidity\s*:\s*([\d.]+)/i.test(part)) {
                      const match = part.match(/([\d.]+)/);
                      return (
                        <span key={j}>
                          <span className="text-cyan-300">Humidity : </span>
                          <span className="text-blue-300">{match?.[1]}</span>
                        </span>
                      );
                    }
                    return <span key={j}>{part}</span>;
                  })}
                </div>
              );
            })}
            {alarmState && serialConnected && (
              <div className="text-red-400 animate-pulse mt-1">
                ⚠ ALARM: Temperature exceeds threshold (31°C)!
              </div>
            )}
            {serialConnected && <span className="text-green-400 animate-pulse">▊</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default SerialMonitor;
