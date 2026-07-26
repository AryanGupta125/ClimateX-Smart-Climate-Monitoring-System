import React, { useState, useEffect } from 'react';

interface LCDDisplayProps {
  temperature: number;
  humidity: number;
  alarmState: boolean;
  bleConnected: boolean;
  sensorError: boolean;
}

const LCDDisplay: React.FC<LCDDisplayProps> = ({
  temperature,
  humidity,
  alarmState,
  bleConnected,
  sensorError,
}) => {
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreen((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Determine LCD backlight color
  let bgColor = '#00e5ff'; // cyan
  if (sensorError) bgColor = '#ff1744';
  else if (screen === 1) bgColor = alarmState ? '#ff1744' : '#00e676';

  let line1 = '';
  let line2 = '';

  if (sensorError) {
    line1 = 'Sensor Error    ';
    line2 = 'Check DHT11     ';
  } else if (screen === 0) {
    line1 = `Temp:${temperature.toFixed(1)}\u00B0C     `;
    line2 = `Hum :${humidity.toFixed(1)}%       `;
  } else {
    line1 = `BLE:${bleConnected ? 'Connected' : 'Waiting'}    `;
    line2 = `Alarm:${alarmState ? 'ON ' : 'OFF'}         `;
  }

  // Pad to 16 chars
  line1 = line1.substring(0, 16).padEnd(16);
  line2 = line2.substring(0, 16).padEnd(16);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">🖥️ LCD Display (16×2)</h3>
        <span className="text-slate-400 text-sm">Screen {screen + 1}/2</span>
      </div>
      <div
        className="rounded-xl p-4 mx-auto max-w-sm transition-all duration-700 border-2 border-black/30"
        style={{
          backgroundColor: `${bgColor}18`,
          boxShadow: `0 0 30px ${bgColor}20, inset 0 0 30px ${bgColor}08`,
        }}
      >
        <div
          className="font-mono text-xl md:text-2xl leading-relaxed tracking-[0.3em] p-3 rounded-lg transition-colors duration-700"
          style={{
            color: bgColor,
            textShadow: `0 0 8px ${bgColor}80`,
            backgroundColor: '#0a0f1a',
          }}
        >
          <div className="overflow-hidden whitespace-pre">{line1}</div>
          <div className="overflow-hidden whitespace-pre">{line2}</div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        <div
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: screen === 0 ? bgColor : '#475569',
            boxShadow: screen === 0 ? `0 0 6px ${bgColor}` : 'none',
          }}
        />
        <div
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: screen === 1 ? bgColor : '#475569',
            boxShadow: screen === 1 ? `0 0 6px ${bgColor}` : 'none',
          }}
        />
      </div>
    </div>
  );
};

export default LCDDisplay;
