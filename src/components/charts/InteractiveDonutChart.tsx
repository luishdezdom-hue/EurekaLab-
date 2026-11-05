/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

export interface InteractiveDonutChartProps {
  title: string;
  description?: string;
  data: DonutSegment[];
  centerLabel?: string;
  unit?: string;
  size?: number;
  onSelectSegment?: (segment: DonutSegment) => void;
  selectedSegmentId?: string;
}

export const InteractiveDonutChart: React.FC<InteractiveDonutChartProps> = ({
  title,
  description,
  data,
  centerLabel = 'Total',
  unit = '',
  size = 200,
  onSelectSegment,
  selectedSegmentId,
}) => {
  // Category toggle state
  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.forEach((d) => {
      init[d.id] = true;
    });
    return init;
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleSegment = (id: string) => {
    setActiveSegments((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[id] && activeCount <= 1) return prev;
      return { ...prev, [id]: !prev[id] };
    });
  };

  const filteredData = data.filter((d) => activeSegments[d.id]);
  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  const hoveredSegment = data.find((d) => d.id === hoveredId);

  // SVG parameters
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray offsets
  let accumulatedAngle = 0;
  const segmentsWithAngles = filteredData.map((d) => {
    const fraction = totalValue > 0 ? d.value / totalValue : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += fraction * circumference;

    return {
      ...d,
      fraction,
      percentage: Math.round(fraction * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up flex flex-col justify-between">
      {/* Title & Description */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 font-fun">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Donut and Legend side-by-side or stacked */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* SVG Donut Circle */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 origin-center transition-all duration-300"
          >
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segmentsWithAngles.map((seg) => {
              const isHovered = hoveredId === seg.id;
              const isSelected = selectedSegmentId === seg.id;

              return (
                <circle
                  key={seg.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredId(seg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelectSegment?.(seg)}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    filter: isHovered || isSelected ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' : 'none',
                  }}
                />
              );
            })}
          </svg>

          {/* Central Metric display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-fun">
              {hoveredSegment ? hoveredSegment.label : centerLabel}
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {hoveredSegment ? hoveredSegment.value : totalValue}
              {unit}
            </span>
            {hoveredSegment && totalValue > 0 && (
              <span className="text-[11px] font-bold font-fun text-indigo-600">
                {Math.round((hoveredSegment.value / totalValue) * 100)}% del total
              </span>
            )}
          </div>
        </div>

        {/* Legend with interactive toggle controls */}
        <div className="flex-1 space-y-2 w-full max-w-xs">
          {data.map((seg) => {
            const isActive = activeSegments[seg.id];
            const isHovered = hoveredId === seg.id;
            const percentage =
              totalValue > 0 ? Math.round((seg.value / totalValue) * 100) : 0;

            return (
              <div
                key={seg.id}
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`p-2 rounded-xl flex items-center justify-between gap-3 text-xs transition-all border ${
                  isHovered
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {/* Checkbox / Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleSegment(seg.id)}
                  className="flex items-center gap-2 text-left cursor-pointer select-none"
                  title={`Haz clic para ${isActive ? 'ocultar' : 'mostrar'}`}
                >
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 transition-transform ${
                      isActive ? 'scale-100' : 'scale-75 opacity-40'
                    }`}
                    style={{ backgroundColor: seg.color }}
                  />
                  <span
                    className={`font-fun font-bold ${
                      isActive ? 'text-slate-800' : 'text-slate-400 line-through'
                    }`}
                  >
                    {seg.label}
                  </span>
                </button>

                {/* Right Value & Percent */}
                <div className="flex items-center gap-1.5 font-mono shrink-0">
                  <span className="font-black text-slate-900 tabular-nums">
                    {seg.value}
                    {unit}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      ({percentage}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
