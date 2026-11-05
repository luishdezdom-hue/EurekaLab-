/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatMetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  badge?: string;
  staggerIndex?: number;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  suffix,
  description,
  icon,
  iconBgColor = 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
  trend,
  onClick,
  badge,
  staggerIndex = 0,
}) => {
  const isClickable = Boolean(onClick);
  const [animatingValue, setAnimatingValue] = useState(false);

  // Trigger gentle pop effect when value changes
  useEffect(() => {
    setAnimatingValue(true);
    const t = setTimeout(() => setAnimatingValue(false), 450);
    return () => clearTimeout(t);
  }, [value]);

  const staggerClass =
    staggerIndex === 1
      ? 'stagger-1'
      : staggerIndex === 2
      ? 'stagger-2'
      : staggerIndex === 3
      ? 'stagger-3'
      : staggerIndex === 4
      ? 'stagger-4'
      : staggerIndex === 5
      ? 'stagger-5'
      : staggerIndex >= 6
      ? 'stagger-6'
      : '';

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative overflow-hidden bg-white/95 rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up ${staggerClass} ${
        isClickable ? 'cursor-pointer' : ''
      }`}
    >
      {/* Dynamic Sheen Sweep on Hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
      />

      {/* Top Ambient Glow on Hover */}
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/0 group-hover:bg-indigo-500/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none"
      />

      {/* Top row: Icon, Category/Title, Badge */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-md shrink-0 ${iconBgColor}`}
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-fun transition-colors group-hover:text-slate-800">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-indigo-200/60">
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Trend Indicator with gentle hover bounce */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-1 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              trend.isPositive === true
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                : trend.isPositive === false
                ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {trend.isPositive === true ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 transition-transform group-hover:-translate-y-0.5" />
            ) : trend.isPositive === false ? (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 transition-transform group-hover:translate-y-0.5" />
            ) : (
              <Minus className="w-3 h-3 text-slate-400" />
            )}
            <span>
              {typeof trend.value === 'number' && trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          </div>
        )}
      </div>

      {/* Main Value with Animated Count Pop */}
      <div className="mt-3.5 flex items-baseline gap-1.5 relative z-10">
        <span
          className={`text-3xl font-black text-slate-900 font-mono tracking-tight tabular-nums transition-all duration-300 ${
            animatingValue ? 'scale-105 text-indigo-900' : 'scale-100'
          }`}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-bold text-slate-400 font-mono">
            {suffix}
          </span>
        )}
      </div>

      {/* Description & Comparative Label */}
      <div className="mt-1 text-xs text-slate-500 flex items-center justify-between gap-2 relative z-10">
        <span className="truncate group-hover:text-slate-700 transition-colors">
          {description}
        </span>
        {trend?.label && (
          <span className="text-[10px] text-slate-400 shrink-0 font-medium font-mono">
            {trend.label}
          </span>
        )}
      </div>

      {/* Subtle bottom accent line with dynamic hover illumination */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-200/50 to-transparent group-hover:via-indigo-500/80 transition-all duration-500" />
    </div>
  );
};
