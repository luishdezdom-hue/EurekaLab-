/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, NavigationSection } from '../../types';
import { Avatar3D } from '../Avatar3D';
import { INITIAL_WARDROBE_ITEMS, storage } from '../../services/storageService';
import { audio } from '../../services/audioService';
import {
  Backpack,
  ArrowLeft,
  Check,
  User,
  Sparkles,
  Shirt,
  Scissors,
  Eye,
} from 'lucide-react';

interface InventorySectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onStudentUpdated: () => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  student,
  onNavigate,
  onStudentUpdated,
}) => {
  const [filter, setFilter] = useState<'all' | 'suit' | 'headgear' | 'accessory' | 'pet'>('all');

  const ownedItems = INITIAL_WARDROBE_ITEMS.filter((item) =>
    student.unlockedItems.includes(item.id)
  );

  const displayedItems =
    filter === 'all' ? ownedItems : ownedItems.filter((i) => i.type === filter);

  const handleEquip = (item: (typeof INITIAL_WARDROBE_ITEMS)[0]) => {
    audio.playPop();
    const updateData: any = {};
    if (item.type === 'suit') {
      updateData.suitId = item.id;
      if (item.color) updateData.suitColor = item.color;
    } else if (item.type === 'headgear') {
      updateData.headgearId = student.avatar.headgearId === item.id ? '' : item.id;
    } else if (item.type === 'accessory') {
      updateData.accessoryId = student.avatar.accessoryId === item.id ? '' : item.id;
    } else if (item.type === 'pet') {
      updateData.petId = student.avatar.petId === item.id ? '' : item.id;
    }

    storage.updateAvatar(student.id, updateData);
    onStudentUpdated();
  };

  const isEquipped = (item: (typeof INITIAL_WARDROBE_ITEMS)[0]) => {
    if (item.type === 'suit') return student.avatar.suitId === item.id;
    if (item.type === 'headgear') return student.avatar.headgearId === item.id;
    if (item.type === 'accessory') return student.avatar.accessoryId === item.id;
    if (item.type === 'pet') return student.avatar.petId === item.id;
    return false;
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-orange-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🎒
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-800 font-fun block">
                Sección 9 • Mochila Personal
              </span>
              <span className="text-[10px] bg-orange-100 text-orange-900 font-bold px-2 py-0.5 rounded-full border border-orange-300">
                {ownedItems.length} Artículos Desbloqueados
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Inventario del Explorador
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Equipa rápidamente tus trajes, calzado, mascotas y accesorios disponibles en tu mochila.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              audio.playPop();
              onNavigate('character');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-fun font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Taller 3D Completo</span>
          </button>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Live Equipped Avatar Preview */}
        <div className="lg:col-span-4 bg-gradient-to-b from-sky-100/80 via-white to-sky-50 rounded-3xl p-5 border-3 border-sky-200/90 shadow-xl flex flex-col items-center justify-between">
          <div className="w-full text-center mb-2">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider font-fun block">
              Vista del Avatar Actual
            </span>
            <p className="text-xs text-slate-500">Muestra los accesorios equipados en tiempo real</p>
          </div>

          <Avatar3D
            avatarConfig={student.avatar}
            interactive={true}
            size="lg"
          />

          <button
            onClick={() => onNavigate('character')}
            className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-fun font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Abrir Vestidor 360° Completo</span>
          </button>
        </div>

        {/* Right Column: Inventory Items Grid */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-orange-200/90 shadow-xl space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Todo en Mochila' },
              { id: 'suit', label: 'Trajes y Ropa' },
              { id: 'headgear', label: 'Cabezal' },
              { id: 'accessory', label: 'Accesorios' },
              { id: 'pet', label: 'Mascotas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  audio.playPop();
                  setFilter(f.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer shrink-0 ${
                  filter === f.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {displayedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {displayedItems.map((item) => {
                const equipped = isEquipped(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleEquip(item)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      equipped
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                        {item.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-fun font-bold text-xs sm:text-sm text-slate-900">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-semibold capitalize">
                        {item.type === 'suit'
                          ? 'Vestimenta'
                          : item.type === 'headgear'
                          ? 'Cabezal'
                          : item.type === 'accessory'
                          ? 'Accesorio'
                          : 'Mascota'}
                      </span>

                      {equipped ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> Equipado
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-orange-600 hover:underline">
                          Equipar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <span className="text-3xl block">🎒</span>
              <p className="text-xs font-bold">No tienes artículos en esta categoría aún.</p>
              <button
                onClick={() => onNavigate('rewards')}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Visitar la Tienda de Recompensas →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
