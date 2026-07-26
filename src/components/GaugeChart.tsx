import React from 'react';

interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min,
  max,
  unit,
  label,
  color,
  warningThreshold,
  dangerThreshold,
}) => {
  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Needle rotates from -120° (0%) to +120° (100%)
  const needleRotation = (percentage / 100) * 240 - 120;

  // Determine color based on thresholds
  let activeColor = color;
  if (dangerThreshold !== undefined && value >= dangerThreshold) {
    activeColor = '#ef4444';
  } else if (warningThreshold !== undefined && value >= warningThreshold) {
    activeColor = '#f59e0b';
  }

  const radius = 80;
  const strokeWidth = 12;
  const center = 100;

  // Create arc path using angles in "gauge space"
  // Gauge spans from 210° to 330° in standard SVG (or -120° to +120° around top)
  const polarToCart = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const arcStart = -120; // left of gauge
  const arcEnd = 120;    // right of gauge
  const arcSpan = arcEnd - arcStart; // 240°

  const makeArc = (fromDeg: number, toDeg: number) => {
    const p1 = polarToCart(fromDeg);
    const p2 = polarToCart(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const bgArc = makeArc(arcStart, arcEnd);
  const valueEndDeg = arcStart + (percentage / 100) * arcSpan;
  const hasValue = percentage > 0.5;

  // Needle length
  const needleLen = radius - 20;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 160" className="w-full max-w-[240px]">
        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc — redrawn each render */}
        {hasValue && (
          <path
            d={makeArc(arcStart, valueEndDeg)}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${activeColor}60)` }}
          />
        )}

        {/* Needle — uses transform:rotate so CSS transition works */}
        <g
          style={{
            transform: `rotate(${needleRotation}deg)`,
            transformOrigin: `${center}px ${center}px`,
            transition: 'transform 0.6s cubic-bezier(.4,2,.6,1)',
          }}
        >
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - needleLen}
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Center dot */}
        <circle cx={center} cy={center} r="6" fill="#e2e8f0" />
        <circle cx={center} cy={center} r="3" fill={activeColor} style={{ transition: 'fill 0.3s' }} />

        {/* Value text */}
        <text
          x={center}
          y={center + 30}
          textAnchor="middle"
          fill={activeColor}
          fontSize="28"
          fontWeight="bold"
          fontFamily="monospace"
          style={{ transition: 'fill 0.3s' }}
        >
          {value.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + 48}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="14"
          fontFamily="sans-serif"
        >
          {unit}
        </text>

        {/* Min / Max labels */}
        <text x="15" y="145" fill="#64748b" fontSize="11" fontFamily="monospace">
          {min}
        </text>
        <text x="185" y="145" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">
          {max}
        </text>
      </svg>
      <span className="text-sm text-slate-400 font-medium -mt-2">{label}</span>
    </div>
  );
};

export default GaugeChart;
