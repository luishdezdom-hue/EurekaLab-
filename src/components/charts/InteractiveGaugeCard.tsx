/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

export interface InteractiveGaugeCardProps {
  title: string;
  subtitle?: string;
  value: number; // 0 to 100
  target?: number; // target goal, default 80
  unit?: string;
  size?: number;
  icon?: React.ReactNode;
}

export const InteractiveGaugeCard: React.FC<InteractiveGaugeCardProps> = ({
  title,
  subtitle,
  value,
  target = 80,
  unit = '%',
  size = 180,
  icon,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  // Semi-circle arc: from angle 180 (left) to 0 (right) => arc length = Math.PI * radius
  const arcLength = Math.PI * radius;
  const fillLength = (Math.min(100, Math.max(0, value)) / 100) * arcLength;

  const isTargetAchieved = value >= target;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up flex flex-col items-center justify-between text-center relative overflow-hidden group">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-left mb-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-fun block">
            Indicador de Cumplimiento
          </span>
          <h4 className="text-xs font-black text-slate-800 font-fun flex items-center gap-1.5 mt-0.5">
            {icon || <Target className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{title}</span>
          </h4>
        </div>
        <span
          className={`text-[10px] font-bold font-fun px-2 py-0.5 rounded-full ${
            isTargetAchieved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isTargetAchieved ? 'Meta Superada' : 'En Progreso'}
        </span>
      </div>

      {/* Semi-circle Gauge SVG */}
      <div className="relative my-2 flex items-center justify-center">
        <svg
          width={size}
          height={size / 2 + strokeWidth + 4}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="70%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${
              center + radius
            } ${center}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${
              center + radius
            } ${center}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLength} ${arcLength}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Value */}
        <div className="absolute bottom-1 inset-x-0 flex flex-col items-center pointer-events-none">
          <span className="text-3xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
            {value}
            <span className="text-sm font-bold text-slate-400 font-mono">
              {unit}
            </span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Meta objetivo: {target}
            {unit}
          </span>
        </div>
      </div>

      {/* Subtitle / Context */}
      {subtitle && (
        <p className="text-[11px] text-slate-500 font-medium max-w-[200px] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
