import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Student, CharacterType } from '../types';
import { ACHIEVEMENTS } from '../services/storageService';
import { storage } from '../services/storageService';
import { audio } from '../services/audioService';
import { Avatar3D, AvatarGesture } from './Avatar3D';
import { GameButton } from './ui/GameButton';
import { Sparkles, X, Award, Check, Palette, Shirt, UserCheck, Smile } from 'lucide-react';

interface AvatarCustomizerModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
}

// 4 Specific Outfits per Character
interface OutfitOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
}

const BOY_OUTFITS: OutfitOption[] = [
  {
    id: 'sport',
    name: 'Traje Deportivo',
    description: 'Jersey atlético de alta agilidad, pantalones cortos y zapatillas deportivas.',
    icon: '⚽',
    badge: 'Atleta',
  },
  {
    id: 'explorer',
    name: 'Ropa de Explorador',
    description: 'Chaleco safari con bolsillos utilitarios, sombrero de expedición y botas.',
    icon: '🧭',
    badge: 'Aventura',
  },
  {
    id: 'futuristic',
    name: 'Ropa Futurista',
    description: 'Peto cibernético con núcleo de plasma azul, visera neón y botas de fotones.',
    icon: '⚡',
    badge: 'Sci-Fi',
  },
  {
    id: 'casual',
    name: 'Conjunto Casual',
    description: 'Sudadera urbana con capucha, vaqueros clásicos y calzado cómodo.',
    icon: '👕',
    badge: 'Urbano',
  },
];

const GIRL_OUTFITS: OutfitOption[] = [
  {
    id: 'sport',
    name: 'Conjunto Deportivo',
    description: 'Top deportivo transpirable, mallas elásticas y diadema aerodinámica.',
    icon: '🏃‍♀️',
    badge: 'Velocidad',
  },
  {
    id: 'explorer',
    name: 'Ropa de Exploradora',
    description: 'Chaleco de campo, cinturón utilitario con brújula y botas de senderismo.',
    icon: '🎒',
    badge: 'Expedición',
  },
  {
    id: 'futuristic',
    name: 'Conjunto Futurista',
    description: 'Traje cuántico con halo luminoso violeta, líneas de datos y botas gravitatorias.',
    icon: '🔮',
    badge: 'Cuántica',
  },
  {
    id: 'casual',
    name: 'Ropa Casual',
    description: 'Chaqueta de diseño moderno, falda o pantalón estilizado y zapatillas casuales.',
    icon: '👗',
    badge: 'Estilo',
  },
];

const ROBOT_OUTFITS: OutfitOption[] = [
  {
    id: 'hat',
    name: 'Sombrero Elegante',
    description: 'Chistera victoriana clásica con cinta dorada pulida sobre chasis de titanio.',
    icon: '🎩',
    badge: 'Caballero',
  },
  {
    id: 'mustache',
    name: 'Bigote Distinguido',
    description: 'Elegante bigote de latón en la placa frontal con monóculo óptico de precisión.',
    icon: '🥸',
    badge: 'Vintage',
  },
  {
    id: 'bow_tie',
    name: 'Corbata con Moño',
    description: 'Pajarita luminosa con núcleo de energía y solapas de esmoquin grabadas con láser.',
    icon: '🎀',
    badge: 'Gala',
  },
  {
    id: 'futuristic_suit',
    name: 'Traje Futurista',
    description: 'Blindaje meca reforzado con propulsores en hombros y reactor de antimateria.',
    icon: '🛡️',
    badge: 'Meca',
  },
];

const SUIT_COLORS = [
  { name: 'Azul Océano', hex: '#0284c7' },
  { name: 'Rosa Medusa', hex: '#ec4899' },
  { name: 'Verde Alga', hex: '#10b981' },
  { name: 'Púrpura Abisal', hex: '#8b5cf6' },
  { name: 'Ámbar Coral', hex: '#f59e0b' },
  { name: 'Cian Neón', hex: '#06b6d4' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  student,
  isOpen,
  onClose,
  onStudentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'character' | 'outfit' | 'colors' | 'achievements'>('character');
  const [triggeredGesture, setTriggeredGesture] = useState<AvatarGesture>('idle');

  if (!isOpen) return null;

  const currentCharacter = student.avatar.characterType || 'boy';
  const currentOutfit = student.avatar.outfitId || 'sport';

  const handleSelectCharacter = (type: CharacterType) => {
    audio.playBalanceSuccess();
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
    // Set default outfit for this character if not compatible
    let defaultOutfit = 'sport';
    if (type === 'robot') defaultOutfit = 'hat';

    storage.updateAvatar(student.id, {
      characterType: type,
      outfitId: defaultOutfit,
    });
    onStudentUpdated();
  };

  const handleSelectOutfit = (outfitId: string) => {
    audio.playPop();
    storage.updateAvatar(student.id, { outfitId });
    onStudentUpdated();
  };

  const handleColorChange = (hex: string) => {
    audio.playPop();
    storage.updateAvatar(student.id, { suitColor: hex });
    onStudentUpdated();
  };

  const handleGestureClick = (gesture: AvatarGesture) => {
    setTriggeredGesture(gesture);
    setTimeout(() => setTriggeredGesture('idle'), 2500);
  };

  const getOutfitsForCharacter = (): OutfitOption[] => {
    if (currentCharacter === 'boy') return BOY_OUTFITS;
    if (currentCharacter === 'girl') return GIRL_OUTFITS;
    return ROBOT_OUTFITS;
  };

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md border-3 border-amber-300/80 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-amber-50 via-white to-sky-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              🎨
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-sky-950 font-fun flex items-center gap-2">
                Personalización de Avatar 3D & Estilo
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Tus Eurekas acumuladas:</span>
                <span className="font-mono font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {student.coins} 🪙
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Left 3D Viewport + Right Customization Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: 3D Live Avatar & Gestures */}
          <div className="md:col-span-5 bg-gradient-to-b from-sky-100/60 via-slate-50 to-sky-100/40 p-4 border-b md:border-b-0 md:border-r border-sky-100 flex flex-col items-center justify-between">
            <div className="w-full text-center">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                Visualización 3D en Tiempo Real
              </span>
              <p className="text-xs text-slate-500">Haz clic y arrastra para girar al personaje 360°</p>
            </div>

            {/* 3D Canvas */}
            <div className="my-2 flex items-center justify-center w-full">
              <Avatar3D
                avatarConfig={student.avatar}
                interactive={false}
                size="lg"
                activeGestureProp={triggeredGesture}
              />
            </div>

            {/* 4 Interactive Gestures Required by User */}
            <div className="w-full bg-white/80 rounded-2xl p-2.5 border border-sky-200 shadow-sm space-y-1.5">
              <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block text-center">
                4 Gestos y Animaciones en Vivo
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => handleGestureClick('wave')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold font-fun transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                    triggeredGesture === 'wave'
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200'
                  }`}
                  title="Levantar una mano y moverla de un lado a otro"
                >
                  <span className="text-base">👋</span>
                  <span className="text-[10px]">Saludar</span>
                </button>

                <button
                  onClick={() => handleGestureClick('jump')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold font-fun transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                    triggeredGesture === 'jump'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}
                  title="Realizar un salto con movimiento natural"
                >
                  <span className="text-base">🦘</span>
                  <span className="text-[10px]">Saltar</span>
                </button>

                <button
                  onClick={() => handleGestureClick('spin')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold font-fun transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                    triggeredGesture === 'spin'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  }`}
                  title="Dar una vuelta completa de 360 grados"
                >
                  <span className="text-base">🔄</span>
                  <span className="text-[10px]">Girar</span>
                </button>

                <button
                  onClick={() => handleGestureClick('dance')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold font-fun transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border ${
                    triggeredGesture === 'dance'
                      ? 'bg-pink-500 text-white border-pink-600 shadow-md'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-900 border-pink-200'
                  }`}
                  title="Animación divertida con movimientos de brazos y cuerpo"
                >
                  <span className="text-base">💃</span>
                  <span className="text-[10px]">Bailar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Tabs & Cards */}
          <div className="md:col-span-7 flex flex-col h-full bg-white">
            {/* Navigation Tabs */}
            <div className="flex border-b border-sky-100 px-4 pt-3 gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  audio.playPop();
                  setActiveTab('character');
                }}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold font-fun transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'character'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>1. Personaje (3)</span>
              </button>

              <button
                onClick={() => {
                  audio.playPop();
                  setActiveTab('outfit');
                }}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold font-fun transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'outfit'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shirt className="w-4 h-4" />
                <span>2. Ropa (4 Opciones)</span>
              </button>

              <button
                onClick={() => {
                  audio.playPop();
                  setActiveTab('colors');
                }}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold font-fun transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'colors'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Colores</span>
              </button>

              <button
                onClick={() => {
                  audio.playPop();
                  setActiveTab('achievements');
                }}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold font-fun transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'achievements'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Logros</span>
              </button>
            </div>

            {/* Tab 1: Character Selector (Niño, Niña, Robot) */}
            {activeTab === 'character' && (
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[55vh]">
                <div>
                  <h3 className="text-sm font-bold text-sky-950 font-fun">
                    Selecciona tu Personaje 3D Principal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cambia de personaje de inmediato con un solo toque:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Niño */}
                  <div
                    onClick={() => handleSelectCharacter('boy')}
                    className={`rounded-2xl p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      currentCharacter === 'boy'
                        ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-300'
                        : 'border-slate-200 hover:border-sky-300 bg-slate-50/70'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50 border border-sky-200/60 flex items-center justify-center p-1 relative shadow-inner">
                        <img
                          src="/assets/aistudio/image_d659f8a6.png"
                          onError={(e) => {
                            e.currentTarget.src = '/public/assets/aistudio/image_d659f8a6.png';
                          }}
                          alt="Niño 3D"
                          className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-sky-800 shadow-xs">
                          👦 Niño
                        </span>
                      </div>
                      <div>
                        <span className="font-fun font-bold text-sm text-sky-950 block">Niño Explorador</span>
                        <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                          Cabello castaño en puntas, camiseta azul con insignia blanca, pantalones oscuros y zapatillas.
                        </p>
                      </div>
                    </div>
                    {currentCharacter === 'boy' ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded-full w-fit">
                        <Check className="w-3.5 h-3.5" /> Equipado
                      </span>
                    ) : (
                      <span className="mt-3 text-[11px] font-bold text-sky-600 hover:underline">
                        Elegir Niño
                      </span>
                    )}
                  </div>

                  {/* Option 2: Niña */}
                  <div
                    onClick={() => handleSelectCharacter('girl')}
                    className={`rounded-2xl p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      currentCharacter === 'girl'
                        ? 'border-pink-500 bg-pink-50/90 ring-2 ring-pink-300'
                        : 'border-slate-200 hover:border-pink-300 bg-slate-50/70'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-pink-100 to-rose-50 border border-pink-200/60 flex items-center justify-center p-1 relative shadow-inner">
                        <img
                          src="/assets/aistudio/image_9e4f2ad9.png"
                          onError={(e) => {
                            e.currentTarget.src = '/public/assets/aistudio/image_9e4f2ad9.png';
                          }}
                          alt="Niña 3D"
                          className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-pink-800 shadow-xs">
                          👧 Niña
                        </span>
                      </div>
                      <div>
                        <span className="font-fun font-bold text-sm text-pink-950 block">Niña Aventurera</span>
                        <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                          Cabello morado con dos moños espaciales, diadema cian, mejillas sonrosadas y vestimenta deportiva.
                        </p>
                      </div>
                    </div>
                    {currentCharacter === 'girl' ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-100 px-2 py-1 rounded-full w-fit">
                        <Check className="w-3.5 h-3.5" /> Equipada
                      </span>
                    ) : (
                      <span className="mt-3 text-[11px] font-bold text-pink-600 hover:underline">
                        Elegir Niña
                      </span>
                    )}
                  </div>

                  {/* Option 3: Robot */}
                  <div
                    onClick={() => handleSelectCharacter('robot')}
                    className={`rounded-2xl p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      currentCharacter === 'robot'
                        ? 'border-cyan-500 bg-cyan-50/90 ring-2 ring-cyan-300'
                        : 'border-slate-200 hover:border-cyan-300 bg-slate-50/70'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-cyan-100 to-slate-100 border border-cyan-200/60 flex items-center justify-center p-1 relative shadow-inner">
                        <img
                          src="/assets/aistudio/image_2afa485a.png"
                          onError={(e) => {
                            e.currentTarget.src = '/public/assets/aistudio/image_2afa485a.png';
                          }}
                          alt="Robot 3D"
                          className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-cyan-800 shadow-xs">
                          🤖 Robot
                        </span>
                      </div>
                      <div>
                        <span className="font-fun font-bold text-sm text-cyan-950 block">Robot Chistera</span>
                        <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                          Sombrero de copa victoriano con cinta, ojos y núcleo cian luminiscentes, brazos y zapatos cibernéticos.
                        </p>
                      </div>
                    </div>
                    {currentCharacter === 'robot' ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 bg-cyan-100 px-2 py-1 rounded-full w-fit">
                        <Check className="w-3.5 h-3.5" /> Equipado
                      </span>
                    ) : (
                      <span className="mt-3 text-[11px] font-bold text-cyan-600 hover:underline">
                        Elegir Robot
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Outfits (4 options per character) */}
            {activeTab === 'outfit' && (
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[55vh]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-sky-950 font-fun">
                      Vestimentas para{' '}
                      {currentCharacter === 'boy' ? 'Niño' : currentCharacter === 'girl' ? 'Niña' : 'Robot'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Exactamente 4 opciones de vestimenta diseñadas a medida:
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                    4 Opciones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getOutfitsForCharacter().map((outfit) => {
                    const isEquipped = currentOutfit === outfit.id;
                    return (
                      <div
                        key={outfit.id}
                        onClick={() => handleSelectOutfit(outfit.id)}
                        className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                          isEquipped
                            ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300/60'
                            : 'border-slate-200 hover:border-sky-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{outfit.icon}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {outfit.badge}
                            </span>
                          </div>
                          <div>
                            <span className="font-fun font-bold text-sm text-slate-900 block">
                              {outfit.name}
                            </span>
                            <p className="text-[11px] text-slate-600 leading-tight">
                              {outfit.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-600">Desbloqueado</span>
                          {isEquipped ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Puesto
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-sky-600 hover:underline">
                              Seleccionar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Colors */}
            {activeTab === 'colors' && (
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[55vh]">
                <div>
                  <h3 className="text-sm font-bold text-sky-950 font-fun">
                    Color de Traje y Resonancia Neón
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajusta el tono de armadura o prenda favorita en tiempo real:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SUIT_COLORS.map((c) => {
                    const isSelected = student.avatar.suitColor === c.hex;
                    return (
                      <button
                        key={c.hex}
                        onClick={() => handleColorChange(c.hex)}
                        className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-inner border border-white"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block">{c.name}</span>
                          {isSelected && (
                            <span className="text-[10px] text-sky-600 font-semibold">Activo</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Achievements */}
            {activeTab === 'achievements' && (
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[55vh]">
                <div>
                  <h3 className="text-sm font-bold text-sky-950 font-fun">
                    Logros y Medallas de Aprendizaje Real
                  </h3>
                  <p className="text-xs text-slate-500">
                    Desbloquea medallas demostrando comprensión en fracciones y algoritmos.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = student.achievements.includes(ach.id) || student.coins >= 50;
                    return (
                      <div
                        key={ach.id}
                        className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 ${
                          isUnlocked
                            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl shrink-0 border border-slate-200">
                          {ach.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-fun font-bold text-xs">{ach.title}</span>
                            {isUnlocked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] leading-tight text-slate-600 mt-0.5">
                            {ach.description}
                          </p>
                          <span className="text-[10px] font-mono font-bold text-amber-700 mt-1 block">
                            +{ach.rewardCoins} Eurekas 🪙
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions Footer */}
            <div className="mt-auto p-4 border-t border-sky-100 flex items-center justify-end bg-slate-50/80">
              <GameButton variant="primary" size="md" onClick={onClose}>
                <span>¡Listo, Guardar Estilo!</span>
              </GameButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
