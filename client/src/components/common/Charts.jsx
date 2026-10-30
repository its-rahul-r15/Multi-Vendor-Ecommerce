import React, { useState } from 'react';
import { formatCurrency } from '../../api/client';

export const AreaChart = ({
  data = [],
  dataKey = 'gmv',
  xKey = 'month',
  height = 240,
  strokeColor = '#4f46e5',
  gradientFrom = '#6366f1',
  gradientTo = '#ffffff',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const values = data.map((d) => d[dataKey] || 0);
  const maxValue = Math.max(...values, 100);
  const minValue = 0;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d[dataKey] - minValue) / (maxValue - minValue)) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.25" />
            <stop offset="100%" stopColor={gradientTo} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                ₹{Math.round((maxValue * pct) / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Smooth Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Interactive Data Points */}
        {points.map((pt, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === i ? 6 : 4}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth={hoveredIndex === i ? 3 : 2}
              className="transition-all duration-150"
            />
            {/* X-axis Label */}
            <text
              x={pt.x}
              y={height - 8}
              textAnchor="middle"
              className={`text-[11px] font-medium transition-colors ${
                hoveredIndex === i ? 'fill-slate-900 font-bold' : 'fill-slate-400'
              }`}
            >
              {pt.data[xKey]}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs shadow-xl animate-fade-in z-20"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 8}%`,
          }}
        >
          <p className="font-semibold">{points[hoveredIndex].data[xKey]}</p>
          <p className="text-emerald-400 font-mono">
            {formatCurrency(points[hoveredIndex].data[dataKey])}
          </p>
        </div>
      )}
    </div>
  );
};

export const BarChart = ({
  data = [],
  dataKey = 'orders',
  xKey = 'day',
  height = 180,
  barColor = '#6366f1',
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d[dataKey] || 0), 10);

  return (
    <div className="flex items-end justify-between gap-2 w-full pt-6" style={{ height }}>
      {data.map((item, i) => {
        const pct = Math.max(8, ((item[dataKey] || 0) / maxValue) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex items-end justify-center h-full">
              {/* Tooltip on bar hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap">
                {item[dataKey]}
              </div>
              <div
                className="w-full max-w-[28px] rounded-t-md transition-all duration-300 group-hover:brightness-110"
                style={{
                  height: `${pct}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-800">
              {item[xKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
};
