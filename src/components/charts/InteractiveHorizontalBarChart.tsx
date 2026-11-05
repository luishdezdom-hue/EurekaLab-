/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export interface HorizontalBarItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  value: number;
  maxValue?: number;
  percentage?: number;
  color?: string;
  badge?: string;
  secondaryText?: string;
}

export interface InteractiveHorizontalBarChartProps {
  title: string;
  description?: string;
  items: HorizontalBarItem[];
  unit?: string;
  showRanking?: boolean;
  onSelectItem?: (item: HorizontalBarItem) => void;
  selectedItemId?: string;
  maxDisplay?: number;
}

export const InteractiveHorizontalBarChart: React.FC<InteractiveHorizontalBarChartProps> = ({
  title,
  description,
  items,
  unit = '%',
  showRanking = true,
  onSelectItem,
  selectedItemId,
  maxDisplay,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const displayItems = maxDisplay ? items.slice(0, maxDisplay) : items;
  const globalMax = Math.max(...items.map((i) => i.maxValue || i.value), 100);

  const getColor = (val: number, customColor?: string) => {
    if (customColor) return customColor;
    if (val >= 85) return 'from-emerald-500 to-teal-400';
    if (val >= 70) return 'from-indigo-500 to-sky-400';
    if (val >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-pink-400';
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up flex flex-col justify-between">
      {/* Title & Description */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 font-fun">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-400 font-bold">
          {items.length} registros
        </span>
      </div>

      {/* List of Bars */}
      <div className="space-y-3.5">
        {displayItems.map((item, idx) => {
          const isHovered = hoveredId === item.id;
          const isSelected = selectedItemId === item.id;
          const pct = item.percentage ?? Math.min(100, Math.round((item.value / globalMax) * 100));

          const staggerClass = idx < 6 ? `stagger-${idx + 1}` : '';

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectItem?.(item)}
              className={`p-2.5 rounded-2xl transition-all duration-300 ease-out cursor-pointer border animate-slide-up ${staggerClass} ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-300 shadow-sm scale-[1.01]'
                  : isHovered
                  ? 'bg-slate-50/90 border-slate-300 shadow-xs -translate-y-0.5 scale-[1.01]'
                  : 'bg-transparent border-transparent'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {showRanking && (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-amber-700/10 text-amber-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                  {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
                  <div className="truncate">
                    <span className="font-bold text-slate-900 font-fun truncate block">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="text-[10px] text-slate-400 font-medium truncate block">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Value & Badge */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-fun">
                      {item.badge}
                    </span>
                  )}
                  <span className="font-mono font-black text-slate-900 tabular-nums text-xs">
                    {item.value}
                    {unit}
                  </span>
                  {item.secondaryText && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({item.secondaryText})
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getColor(pct, item.color)} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
