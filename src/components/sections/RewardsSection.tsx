/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Student, NavigationSection } from '../../types';
import { ACHIEVEMENTS, INITIAL_WARDROBE_ITEMS, storage } from '../../services/storageService';
import { audio } from '../../services/audioService';
import {
  Trophy,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Check,
  Lock,
  Crown,
  Award,
  Zap,
} from 'lucide-react';

interface RewardsSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onStudentUpdated: () => void;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({
  student,
  onNavigate,
  onStudentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'trophies' | 'store'>('trophies');
  const [storeFilter, setStoreFilter] = useState<'all' | 'suit' | 'accessory' | 'pet'>('all');

  const handleBuyItem = (itemId: string, price: number) => {
    if (student.coins < price) {
      audio.playBuzzer();
      return;
    }
    const success = storage.buyItem(student.id, itemId);
    if (success) {
      audio.playRewardClaim();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#38bdf8', '#10b981'],
      });
      onStudentUpdated();
    }
  };

  const filteredItems =
    storeFilter === 'all'
      ? INITIAL_WARDROBE_ITEMS
      : INITIAL_WARDROBE_ITEMS.filter((i) => i.type === storeFilter);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-amber-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🏆
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-fun block">
                Sección 8 • Salón de la Fama
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                Logros y Tienda Eureka
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Recompensas y Tienda
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Colecciona trofeos académicos y utiliza tus Eurekas 🪙 para desbloquear artículos especiales.
            </p>
          </div>
        </div>

        {/* Eurekas balance + Return button */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border-2 border-amber-300 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-xs">
            <span className="text-xl">🪙</span>
            <div>
              <span className="text-[10px] text-amber-800 font-bold block uppercase leading-none">
                Tus Eurekas
              </span>
              <span className="text-sm font-black font-mono text-amber-950 leading-none">
                {student.coins}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playPop();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Trofeos vs Tienda */}
      <div className="flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-amber-200 max-w-fit">
        <button
          onClick={() => {
            audio.playPop();
            setActiveTab('trophies');
          }}
          className={`px-4 py-2 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'trophies'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Trofeos y Logros ({student.achievements.length}/{ACHIEVEMENTS.length})</span>
        </button>

        <button
          onClick={() => {
            audio.playPop();
            setActiveTab('store');
          }}
          className={`px-4 py-2 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'store'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tienda de Canje con Eurekas</span>
        </button>
      </div>

      {/* TAB 1: TROFEOS Y LOGROS */}
      {activeTab === 'trophies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = student.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white/95 border-amber-300 shadow-md ring-2 ring-amber-100'
                    : 'bg-white/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs">
                      {ach.icon}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isUnlocked ? '✓ Obtenido' : '🔒 Bloqueado'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-fun font-bold text-base text-slate-900">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold capitalize">
                    {ach.category === 'math'
                      ? 'Matemáticas'
                      : ach.category === 'code'
                      ? 'Algoritmos'
                      : ach.category === 'reading'
                      ? 'Lectura'
                      : 'Maestría'}
                  </span>
                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    +{ach.rewardCoins} 🪙
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TIENDA DE CANJE */}
      {activeTab === 'store' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Subfilter */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'suit', label: 'Trajes' },
              { id: 'accessory', label: 'Accesorios' },
              { id: 'pet', label: 'Mascotas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStoreFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-fun font-bold transition cursor-pointer ${
                  storeFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isOwned = student.unlockedItems.includes(item.id);
              const canAfford = student.coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between bg-white/95 ${
                    isOwned
                      ? 'border-emerald-300 shadow-sm'
                      : 'border-slate-200 hover:border-amber-300 shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {item.price} 🪙
                      </span>
                    </div>

                    <div>
                      <h3 className="font-fun font-bold text-base text-slate-900">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isOwned ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> En tu Inventario
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item.id, item.price)}
                        disabled={!canAfford}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-fun font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Canjear Artículo' : 'Eurekas Insuficientes'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
