/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolSection } from '../../types';

export interface SectionComparisonMetric {
  sectionId: string;
  sectionName: string;
  icon: string;
  grade: string;
  teacherName: string;
  studentCount: number;
  averageGrade: number;
  completionRate: number;
  subjectMastery: {
    matematicas: number;
    algoritmos: number;
    lectura: number;
    ciencias: number;
    circuitos: number;
  };
}

export interface InteractiveSectionComparisonProps {
  title: string;
  description?: string;
  sectionsData: SectionComparisonMetric[];
  onSelectSection?: (sectionId: string) => void;
}

export const InteractiveSectionComparison: React.FC<InteractiveSectionComparisonProps> = ({
  title,
  description,
  sectionsData,
  onSelectSection,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<
    'all' | 'matematicas' | 'algoritmos' | 'lectura' | 'ciencias' | 'circuitos'
  >('all');

  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  const subjects = [
    { id: 'all', label: 'Promedio General', icon: '🏆' },
    { id: 'matematicas', label: 'Matemáticas', icon: '⚖️' },
    { id: 'algoritmos', label: 'Algoritmos', icon: '🧩' },
    { id: 'lectura', label: 'Lectura', icon: '📖' },
    { id: 'ciencias', label: 'Ciencias', icon: '🌿' },
    { id: 'circuitos', label: 'Circuitos', icon: '⚡' },
  ];

  const getScoreForSection = (sec: SectionComparisonMetric) => {
    if (selectedSubject === 'all') return sec.averageGrade;
    return sec.subjectMastery[selectedSubject] ?? sec.averageGrade;
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up flex flex-col justify-between">
      {/* Title & Subject Selector Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 font-fun">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSubject(s.id as any)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-fun rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                selectedSubject === s.id
                  ? 'bg-white text-indigo-900 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="transition-transform group-hover:scale-110">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sections Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {sectionsData.map((sec, idx) => {
          const score = getScoreForSection(sec);
          const isHovered = hoveredSectionId === sec.sectionId;
          const staggerClass = idx < 4 ? `stagger-${idx + 1}` : '';

          const colorClass =
            score >= 90
              ? 'from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50'
              : score >= 80
              ? 'from-indigo-500 to-sky-500 text-indigo-700 bg-indigo-50'
              : score >= 70
              ? 'from-amber-500 to-orange-500 text-amber-700 bg-amber-50'
              : 'from-rose-500 to-red-500 text-rose-700 bg-rose-50';

          return (
            <div
              key={sec.sectionId}
              onMouseEnter={() => setHoveredSectionId(sec.sectionId)}
              onMouseLeave={() => setHoveredSectionId(null)}
              onClick={() => onSelectSection?.(sec.sectionId)}
              className={`p-4 rounded-2xl border card-interactive group cursor-pointer animate-slide-up ${staggerClass} ${
                isHovered
                  ? 'border-indigo-400 bg-indigo-50/30 shadow-md -translate-y-1'
                  : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              {/* Card Header: Icon, Name, Grade */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {sec.icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs font-fun truncate max-w-[140px] group-hover:text-indigo-900 transition-colors">
                      {sec.sectionName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {sec.teacherName}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-fun">
                  {sec.grade}
                </span>
              </div>

              {/* Main Score Display */}
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                  {score}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
                <span className={`text-[10px] font-bold font-fun px-2 py-0.5 rounded-full ${colorClass.split(' ')[2]} ${colorClass.split(' ')[3]}`}>
                  {score >= 90 ? 'Excelente' : score >= 80 ? 'Destacado' : score >= 70 ? 'Aceptable' : 'Refuerzo'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} transition-all duration-500`}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>

              {/* Metrics footer */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{sec.studentCount} estudiantes</span>
                <span className="font-bold text-slate-700">
                  {sec.completionRate}% entregas
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
