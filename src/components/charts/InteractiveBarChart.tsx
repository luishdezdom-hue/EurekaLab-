/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export interface BarDataPoint {
  id: string;
  label: string;
  sublabel?: string;
  values: {
    [seriesKey: string]: number;
  };
  total?: number;
}

export interface BarSeriesConfig {
  key: string;
  label: string;
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface InteractiveBarChartProps {
  title: string;
  description?: string;
  data: BarDataPoint[];
  series: BarSeriesConfig[];
  maxValue?: number;
  height?: number;
  unit?: string;
  onSelectBar?: (point: BarDataPoint) => void;
  selectedBarId?: string;
}

export const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({
  title,
  description,
  data,
  series,
  maxValue,
  height = 280,
  unit = '',
  onSelectBar,
  selectedBarId,
}) => {
  // Toggle active series in legend
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    series.forEach((s) => {
      init[s.key] = true;
    });
    return init;
  });

  // Hover state for tooltip
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleSeries = (key: string) => {
    setActiveSeries((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      // Do not allow toggling off the last remaining active series
      if (prev[key] && activeCount <= 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Visible series
  const visibleSeries = series.filter((s) => activeSeries[s.key]);

  // Compute scale max
  const computedMax =
    maxValue ||
    Math.max(
      ...data.flatMap((d) =>
        visibleSeries.map((s) => d.values[s.key] || 0)
      ),
      10
    );

  // Ceiling to nice round number
  const roundMax = Math.ceil(computedMax / 10) * 10 || 100;

  // Chart dimensions & padding
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;
  const chartWidth = Math.max(500, data.length * 60);
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const barGroupWidth = innerWidth / (data.length || 1);
  const barPadding = 0.25; // padding between groups
  const usableGroupWidth = barGroupWidth * (1 - barPadding);
  const individualBarWidth = Math.max(
    8,
    Math.min(32, usableGroupWidth / (visibleSeries.length || 1))
  );

  const gridSteps = [0, roundMax * 0.25, roundMax * 0.5, roundMax * 0.75, roundMax];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up flex flex-col justify-between">
      {/* Header with Title, Description, and Interactive Series Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 font-fun flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Legend / Series Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {series.map((s) => {
            const isActive = activeSeries[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSeries(s.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer select-none border ${
                  isActive
                    ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                    : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                }`}
                title={`Haz clic para ${isActive ? 'ocultar' : 'mostrar'} ${s.label}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Viewport */}
      <div className="relative overflow-x-auto overflow-y-hidden custom-scrollbar">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[420px]"
          style={{ height: `${height}px` }}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`bar-grad-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={s.gradientFrom || s.color}
                  stopOpacity="1"
                />
                <stop
                  offset="100%"
                  stopColor={s.gradientTo || s.color}
                  stopOpacity="0.8"
                />
              </linearGradient>
            ))}
          </defs>

          {/* Gridlines & Y-Axis Labels */}
          {gridSteps.map((step, idx) => {
            const y = paddingTop + innerHeight - (step / roundMax) * innerHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={step === 0 ? 'none' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono font-medium fill-slate-400 select-none"
                >
                  {Math.round(step)}
                  {unit}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((point, groupIdx) => {
            const groupCenterX =
              paddingLeft + groupIdx * barGroupWidth + barGroupWidth / 2;
            const groupTotalWidth =
              visibleSeries.length * individualBarWidth +
              (visibleSeries.length - 1) * 3;
            const groupStartX = groupCenterX - groupTotalWidth / 2;
            const isHovered = hoveredIndex === groupIdx;
            const isSelected = selectedBarId === point.id;

            return (
              <g
                key={point.id}
                onMouseEnter={() => setHoveredIndex(groupIdx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectBar?.(point)}
                className="cursor-pointer"
              >
                {/* Highlight background strip on hover / selected */}
                {(isHovered || isSelected) && (
                  <rect
                    x={paddingLeft + groupIdx * barGroupWidth + 4}
                    y={paddingTop}
                    width={barGroupWidth - 8}
                    height={innerHeight}
                    rx="10"
                    fill={isSelected ? '#6366f1' : '#f1f5f9'}
                    fillOpacity={isSelected ? 0.12 : 0.6}
                  />
                )}

                {/* Individual Series Bars */}
                {visibleSeries.map((s, seriesIdx) => {
                  const val = point.values[s.key] || 0;
                  const barHeight = Math.max(
                    3,
                    (val / roundMax) * innerHeight
                  );
                  const x =
                    groupStartX + seriesIdx * (individualBarWidth + 3);
                  const y = paddingTop + innerHeight - barHeight;

                  const isBarHovered = isHovered || isSelected;

                  return (
                    <g key={s.key}>
                      <rect
                        x={x}
                        y={y}
                        width={individualBarWidth}
                        height={barHeight}
                        rx="5"
                        fill={`url(#bar-grad-${s.key})`}
                        style={{
                          transition: 'y 0.65s cubic-bezier(0.16, 1, 0.3, 1), height 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease, filter 0.25s ease',
                          transformOrigin: 'bottom',
                          transform: isBarHovered ? 'scaleY(1.02) translateY(-2px)' : 'scaleY(1)',
                          filter: isBarHovered
                            ? 'brightness(1.12) drop-shadow(0 6px 12px rgba(99,102,241,0.25))'
                            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
                        }}
                      />
                      {/* Top value label on hover */}
                      {(isHovered || isSelected) && (
                        <text
                          x={x + individualBarWidth / 2}
                          y={y - 7}
                          textAnchor="middle"
                          className="text-[9px] font-mono font-bold fill-slate-800 select-none animate-fade-in"
                        >
                          {val}
                          {unit}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* X-Axis Label */}
                <text
                  x={groupCenterX}
                  y={chartHeight - paddingBottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-fun select-none transition-colors ${
                    isHovered || isSelected
                      ? 'fill-indigo-700 font-black'
                      : 'fill-slate-600 font-bold'
                  }`}
                >
                  {point.label.length > 12
                    ? `${point.label.substring(0, 11)}…`
                    : point.label}
                </text>

                {point.sublabel && (
                  <text
                    x={groupCenterX}
                    y={chartHeight - paddingBottom + 30}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400 select-none"
                  >
                    {point.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box when hovered */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute top-2 right-4 z-20 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md pointer-events-none animate-in fade-in duration-150"
          >
            <div className="font-bold font-fun text-white border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>{data[hoveredIndex].label}</span>
              {data[hoveredIndex].sublabel && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {data[hoveredIndex].sublabel}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {visibleSeries.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-3 text-[11px]"
                >
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.label}:</span>
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {data[hoveredIndex].values[s.key] ?? 0}
                    {unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
