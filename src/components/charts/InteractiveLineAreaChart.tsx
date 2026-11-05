/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';

export interface LineDataPoint {
  date: string;
  label: string;
  values: {
    [seriesKey: string]: number;
  };
}

export interface LineSeriesConfig {
  key: string;
  label: string;
  color: string;
  fillGradientFrom?: string;
  fillGradientTo?: string;
}

export interface InteractiveLineAreaChartProps {
  title: string;
  description?: string;
  data: LineDataPoint[];
  series: LineSeriesConfig[];
  height?: number;
  unit?: string;
  periodOptions?: { id: string; label: string }[];
  activePeriod?: string;
  onPeriodChange?: (periodId: string) => void;
  maxValue?: number;
}

export const InteractiveLineAreaChart: React.FC<InteractiveLineAreaChartProps> = ({
  title,
  description,
  data,
  series,
  height = 280,
  unit = '',
  periodOptions,
  activePeriod,
  onPeriodChange,
  maxValue,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle active series in legend
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    series.forEach((s) => {
      init[s.key] = true;
    });
    return init;
  });

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const toggleSeries = (key: string) => {
    setActiveSeries((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount <= 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const visibleSeries = series.filter((s) => activeSeries[s.key]);

  // Compute Max
  const calculatedMax =
    maxValue ||
    Math.max(
      ...data.flatMap((d) => visibleSeries.map((s) => d.values[s.key] || 0)),
      10
    );
  const roundMax = Math.ceil(calculatedMax / 10) * 10 || 100;

  // Chart dimensions & coordinates
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = Math.max(540, data.length * 65);
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (value: number) => {
    return paddingTop + innerHeight - (value / roundMax) * innerHeight;
  };

  // Generate smooth cubic bezier SVG path
  const generateBezierPath = (seriesKey: string, closeForArea = false) => {
    if (data.length === 0) return '';
    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(d.values[seriesKey] || 0),
    }));

    if (points.length === 1) {
      if (closeForArea) {
        return `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y} L ${points[0].x + 20} ${paddingTop + innerHeight} L ${points[0].x - 20} ${paddingTop + innerHeight} Z`;
      }
      return `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    if (closeForArea) {
      const last = points[points.length - 1];
      const first = points[0];
      path += ` L ${last.x} ${paddingTop + innerHeight} L ${first.x} ${paddingTop + innerHeight} Z`;
    }

    return path;
  };

  const gridSteps = [0, roundMax * 0.25, roundMax * 0.5, roundMax * 0.75, roundMax];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up flex flex-col justify-between">
      {/* Top Header: Title, Description, Period Filters and Series Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 font-fun">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector Tabs */}
          {periodOptions && periodOptions.length > 0 && onPeriodChange && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              {periodOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onPeriodChange(opt.id)}
                  className={`px-2.5 py-1 text-xs font-bold font-fun rounded-lg transition-colors cursor-pointer ${
                    activePeriod === opt.id
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Series Toggle Buttons */}
          <div className="flex items-center gap-1.5">
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
      </div>

      {/* SVG Chart Area */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto overflow-y-hidden custom-scrollbar"
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[440px]"
          style={{ height: `${height}px` }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`line-area-grad-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={s.fillGradientFrom || s.color}
                  stopOpacity="0.35"
                />
                <stop
                  offset="100%"
                  stopColor={s.fillGradientTo || s.color}
                  stopOpacity="0.0"
                />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridSteps.map((step, idx) => {
            const y = getY(step);
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

          {/* Area Fills */}
          {visibleSeries.map((s) => (
            <path
              key={`area-${s.key}`}
              d={generateBezierPath(s.key, true)}
              fill={`url(#line-area-grad-${s.key})`}
              className="transition-all duration-300"
            />
          ))}

          {/* Line Strokes */}
          {visibleSeries.map((s) => (
            <path
              key={`stroke-${s.key}`}
              d={generateBezierPath(s.key, false)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          ))}

          {/* Hover Crosshair Guide */}
          {hoverIndex !== null && data[hoverIndex] && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + innerHeight}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Dots on points & invisible touch targets */}
          {data.map((point, idx) => {
            const x = getX(idx);
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                className="cursor-pointer"
              >
                {/* Invisible wide hover detector strip */}
                <rect
                  x={x - (innerWidth / (data.length * 2 || 1))}
                  y={paddingTop}
                  width={innerWidth / (data.length || 1)}
                  height={innerHeight}
                  fill="transparent"
                />

                {/* Visible Dots for each series */}
                {visibleSeries.map((s) => {
                  const val = point.values[s.key] || 0;
                  const y = getY(val);

                  return (
                    <g key={s.key}>
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill={s.color}
                          fillOpacity="0.25"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#ffffff"
                        stroke={s.color}
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* X-Axis Date/Label */}
                <text
                  x={x}
                  y={chartHeight - paddingBottom + 20}
                  textAnchor="middle"
                  className={`text-[10px] font-fun select-none transition-colors ${
                    isHovered
                      ? 'fill-indigo-700 font-bold'
                      : 'fill-slate-500 font-medium'
                  }`}
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute top-2 right-4 z-20 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md pointer-events-none animate-in fade-in duration-150"
          >
            <div className="font-bold font-fun text-white border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>{data[hoverIndex].label}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {data[hoverIndex].date}
              </span>
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
                    {data[hoverIndex].values[s.key] ?? 0}
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
