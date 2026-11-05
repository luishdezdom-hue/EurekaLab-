/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Student, CharacterType, StudentAvatar } from '../types';
import { storage } from '../services/storageService';
import { authService } from '../services/authService';
import { audio } from '../services/audioService';
import { Avatar3D, AvatarGesture } from './Avatar3D';
import { GameButton } from './ui/GameButton';
import {
  Sparkles,
  Check,
  Lock,
  Palette,
  Shirt,
  UserCheck,
  Smile,
  Crown,
  Save,
  CheckCircle2,
  Scissors,
  RotateCcw,
  Eye,
  Camera,
  Award,
} from 'lucide-react';

interface MyCharacterViewProps {
  student: Student;
  onStudentUpdated: () => void;
  onBackToHome: () => void;
}

type TabType =
  | 'character'
  | 'hair'
  | 'face_eyes'
  | 'outfit'
  | 'colors'
  | 'shoes'
  | 'accessories'
  | 'unlockables';

export const MyCharacterView: React.FC<MyCharacterViewProps> = ({
  student,
  onStudentUpdated,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('character');
  const [currentGesture, setCurrentGesture] = useState<AvatarGesture>('idle');
  const [cameraZoomMode, setCameraZoomMode] = useState<'full' | 'face' | 'torso' | 'shoes'>('full');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Draft Avatar State (immediate real-time 3D preview)
  const [draftAvatar, setDraftAvatar] = useState<StudentAvatar>(() => ({
    ...student.avatar,
    characterType: student.avatar.characterType || 'boy',
    outfitId: student.avatar.outfitId || 'sport',
    suitColor: student.avatar.suitColor || '#0284c7',
    pantsColor: student.avatar.pantsColor || '#0f172a',
    shoesColor: student.avatar.shoesColor || '#f8fafc',
    skinColor:
      student.avatar.skinColor ||
      (student.avatar.characterType === 'robot' ? '#0f172a' : '#ffdfcb'),
    eyeColor:
      student.avatar.eyeColor ||
      (student.avatar.characterType === 'robot'
        ? '#06b6d4'
        : student.avatar.characterType === 'girl'
        ? '#4338ca'
        : '#1e3a8a'),
    hairstyleId:
      student.avatar.hairstyleId ||
      (student.avatar.characterType === 'girl'
        ? 'girl_twintails'
        : student.avatar.characterType === 'robot'
        ? 'robot_core'
        : 'boy_sport'),
    hairColor:
      student.avatar.hairColor ||
      (student.avatar.characterType === 'girl'
        ? '#7e22ce'
        : student.avatar.characterType === 'robot'
        ? '#06b6d4'
        : '#451a03'),
    shoesId: student.avatar.shoesId || 'shoes_sneakers',
    headgearId: student.avatar.headgearId || '',
    accessoryId: student.avatar.accessoryId || '',
    specialUnlockableId: student.avatar.specialUnlockableId || '',
    expression: student.avatar.expression || 'happy',
  }));

  // Unlock verification logic
  const isUnlocked = (req: {
    minLevel?: number;
    coinsCost?: number;
    free?: boolean;
    subject?: 'matematicas' | 'algoritmos' | 'lectura';
  }) => {
    if (req.free) return true;
    if (req.minLevel && req.subject) {
      const studentLvl = student.progress[req.subject] || 1;
      return studentLvl >= req.minLevel;
    }
    if (req.minLevel) {
      return (student.progress.algoritmos || 1) >= req.minLevel;
    }
    if (req.coinsCost) {
      return student.coins >= req.coinsCost;
    }
    return true;
  };

  // 1. SELECT CHARACTER BASE
  const handleSelectCharacter = (type: CharacterType) => {
    audio.playPop();
    const defaultHairstyle =
      type === 'girl' ? 'girl_twintails' : type === 'robot' ? 'robot_core' : 'boy_sport';
    const defaultHairColor =
      type === 'girl' ? '#7e22ce' : type === 'robot' ? '#06b6d4' : '#451a03';
    const defaultSkin = type === 'robot' ? '#0f172a' : '#ffdfcb';
    const defaultEye = type === 'robot' ? '#06b6d4' : type === 'girl' ? '#4338ca' : '#1e3a8a';
    const defaultColor = type === 'robot' ? '#0f172a' : '#0284c7';
    const defaultOutfit = type === 'robot' ? 'hat' : 'sport';
    const defaultShoes = type === 'robot' ? '#1d4ed8' : '#f8fafc';

    setDraftAvatar((prev) => ({
      ...prev,
      characterType: type,
      hairstyleId: defaultHairstyle,
      hairColor: defaultHairColor,
      skinColor: defaultSkin,
      eyeColor: defaultEye,
      suitColor: defaultColor,
      outfitId: defaultOutfit,
      shoesColor: defaultShoes,
    }));
  };

  // 2. HAIRSTYLE
  const handleSelectHairstyle = (id: string, req: any) => {
    if (!isUnlocked(req)) {
      audio.playBuzzer();
      return;
    }
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, hairstyleId: id }));
  };

  // 3. HAIR COLOR
  const handleSelectHairColor = (hex: string) => {
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, hairColor: hex }));
  };

  // 4. SKIN COLOR
  const handleSelectSkinColor = (hex: string) => {
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, skinColor: hex }));
  };

  // 5. EYE COLOR
  const handleSelectEyeColor = (hex: string) => {
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, eyeColor: hex }));
  };

  // 6. OUTFIT
  const handleSelectOutfit = (id: string, req: any) => {
    if (!isUnlocked(req)) {
      audio.playBuzzer();
      return;
    }
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, outfitId: id }));
  };

  // 7. SUIT COLOR
  const handleSelectSuitColor = (hex: string) => {
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, suitColor: hex }));
  };

  // 8. PANTS COLOR
  const handleSelectPantsColor = (hex: string) => {
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, pantsColor: hex }));
  };

  // 9. SHOES
  const handleSelectShoes = (id: string, req: any) => {
    if (!isUnlocked(req)) {
      audio.playBuzzer();
      return;
    }
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, shoesId: id }));
  };

  // 10. SHOES COLOR
  const handleSelectShoesColor = (hex: string) => {
    audio.playPop();
    setDraftAvatar((prev) => ({ ...prev, shoesColor: hex }));
  };

  // 11. ACCESSORIES
  const handleSelectAccessory = (accId: string, req: any) => {
    if (!isUnlocked(req)) {
      audio.playBuzzer();
      return;
    }
    audio.playPop();
    setDraftAvatar((prev) => ({
      ...prev,
      accessoryId: prev.accessoryId === accId ? '' : accId,
    }));
  };

  // 12. SPECIAL UNLOCKABLES
  const handleSelectUnlockable = (unlockId: string, req: any) => {
    if (!isUnlocked(req)) {
      audio.playBuzzer();
      return;
    }
    audio.playPop();
    setDraftAvatar((prev) => ({
      ...prev,
      specialUnlockableId: prev.specialUnlockableId === unlockId ? '' : unlockId,
    }));
  };

  // 13. EXPRESSION
  const handleSelectExpression = (expr: 'happy' | 'thinking' | 'victory' | 'curious' | 'wink') => {
    audio.playCharacterInteract();
    setDraftAvatar((prev) => ({ ...prev, expression: expr }));
  };

  // 14. SAVE TO STUDENT PROFILE
  const handleSaveAvatar = () => {
    // 1. Save to local storage
    storage.updateAvatar(student.id, { ...draftAvatar });

    // 2. Sync to Firestore for active student
    authService.saveStudentProgress({
      ...student,
      avatar: { ...draftAvatar },
    });

    audio.playRewardClaim();

    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'],
    });

    setSaveSuccessMessage('¡Tu personaje 3D ha sido guardado exitosamente en tu perfil!');
    onStudentUpdated();

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
  };

  const isGirl = draftAvatar.characterType === 'girl';
  const isRobot = draftAvatar.characterType === 'robot';

  // HAIRSTYLES
  const BOY_HAIRSTYLES = [
    {
      id: 'boy_sport',
      name: 'Corto Deportivo',
      desc: 'Peinado con flequillo esculpido hacia adelante y mechones dinámicos.',
      icon: '✂️',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'boy_messy',
      name: 'Despeinado Aventura',
      desc: 'Mechones ondulados con volumen orgánico y capas de explorador.',
      icon: '🌪️',
      req: { minLevel: 2, subject: 'algoritmos' as const },
      reqText: 'Requiere Nivel 2 en Algoritmos',
    },
    {
      id: 'boy_spiky',
      name: 'Puntas de Campeón',
      desc: 'Conos esculpidos tridimensionales con silueta anime heroica.',
      icon: '⚡',
      req: { minLevel: 3, subject: 'matematicas' as const },
      reqText: 'Requiere Nivel 3 en Matemáticas',
    },
    {
      id: 'boy_sidepart',
      name: 'Raya Lateral Clásica',
      desc: 'Peinado pulcro con volumen lateral y raya bien definida.',
      icon: '📐',
      req: { coinsCost: 35 },
      reqText: 'Requiere 35 Eurekas 🪙',
    },
  ];

  const GIRL_HAIRSTYLES = [
    {
      id: 'girl_twintails',
      name: 'Coletas Dobles con Lazos',
      desc: 'Dos coletas fluidas con volumen, lazos cian y flequillo suave.',
      icon: '🎀',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'girl_buns',
      name: 'Moños Espaciales Dobles',
      desc: 'Doble moño superior con diadema cian y mechones laterales.',
      icon: '🪐',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'girl_bob',
      name: 'Melena Bob Esculpida',
      desc: 'Corte recto moderno con flequillo estilizado en 3D.',
      icon: '💇‍♀️',
      req: { coinsCost: 35 },
      reqText: 'Requiere 35 Eurekas 🪙',
    },
    {
      id: 'girl_waves',
      name: 'Ondas Largas con Diadema',
      desc: 'Cabello largo ondeado sobre los hombros con broche estelar.',
      icon: '🌸',
      req: { minLevel: 3, subject: 'lectura' as const },
      reqText: 'Requiere Nivel 3 en Lectura',
    },
  ];

  const ROBOT_MODULES = [
    {
      id: 'robot_core',
      name: 'Chistera Victoriana Clásica',
      desc: 'Sombrero de copa negro pulido con cinta café sobre aleación metálica.',
      icon: '🎩',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'robot_antenna',
      name: 'Antena Cuántica de Datos',
      desc: 'Emisor oscilante con núcleo luminiscente receptor de señales.',
      icon: '📡',
      req: { minLevel: 2, subject: 'algoritmos' as const },
      reqText: 'Requiere Nivel 2 en Algoritmos',
    },
    {
      id: 'robot_visor',
      name: 'Visor Holográfico de Escaneo',
      desc: 'Panel curvo de lectura espectral de terreno y telemetría.',
      icon: '🥽',
      req: { coinsCost: 40 },
      reqText: 'Requiere 40 Eurekas 🪙',
    },
  ];

  // COLOR PALETTES
  const SKIN_TONES = [
    { name: 'Porcelana Clara', hex: '#ffdfcb' },
    { name: 'Beige Cálido', hex: '#fcd34d' },
    { name: 'Trigueño Dorado', hex: '#d97706' },
    { name: 'Moreno Bronce', hex: '#92400e' },
    { name: 'Cacao Profundo', hex: '#451a03' },
    { name: 'Titanio Metálico (Robot)', hex: '#0f172a' },
  ];

  const EYE_COLORS = [
    { name: 'Azul Océano', hex: '#1e3a8a' },
    { name: 'Café Avellana', hex: '#78350f' },
    { name: 'Verde Esmeralda', hex: '#047857' },
    { name: 'Violeta Mágico', hex: '#6d28d9' },
    { name: 'Ámbar Brillante', hex: '#d97706' },
    { name: 'Cian Neón', hex: '#06b6d4' },
  ];

  const HAIR_COLORS = [
    { name: 'Castaño Chocolate', hex: '#451a03' },
    { name: 'Negro Azabache', hex: '#18181b' },
    { name: 'Rubio Dorado', hex: '#eab308' },
    { name: 'Rojo Cobrizo', hex: '#b91c1c' },
    { name: 'Púrpura Cósmico', hex: '#7e22ce' },
    { name: 'Azul Eléctrico', hex: '#0284c7' },
    { name: 'Platino Puro', hex: '#e2e8f0' },
  ];

  const CLOTHING_COLORS = [
    { name: 'Azul Real', hex: '#0284c7' },
    { name: 'Rosa Coral', hex: '#ec4899' },
    { name: 'Verde Esmeralda', hex: '#10b981' },
    { name: 'Púrpura Cósmico', hex: '#8b5cf6' },
    { name: 'Ámbar Cálido', hex: '#f59e0b' },
    { name: 'Cian Neón', hex: '#06b6d4' },
    { name: 'Negro Titanio', hex: '#0f172a' },
    { name: 'Blanco Nieve', hex: '#f8fafc' },
  ];

  const PANTS_COLORS = [
    { name: 'Negro Medianoche', hex: '#0f172a' },
    { name: 'Azul Marino', hex: '#1e3a8a' },
    { name: 'Gris Carbón', hex: '#334155' },
    { name: 'Caqui Safari', hex: '#78350f' },
    { name: 'Blanco Deportivo', hex: '#f8fafc' },
  ];

  // OUTFITS
  const OUTFITS = [
    {
      id: 'sport',
      name: 'Traje Deportivo de Carreras',
      desc: 'Jersey atlético transpirable con parche central y pantalón elástico.',
      icon: '🏃',
      badge: 'Atleta',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'explorer',
      name: 'Uniforme de Explorador de Campo',
      desc: 'Chaleco safari con bolsillos utilitarios 3D y cinturón con hebilla.',
      icon: '🧭',
      badge: 'Expedición',
      req: { minLevel: 2, subject: 'algoritmos' as const },
      reqText: 'Requiere Nivel 2 en Algoritmos',
    },
    {
      id: 'futuristic',
      name: 'Armadura Cuántica Neón',
      desc: 'Peto cibernético con núcleo de plasma azul luminiscente y hombreras.',
      icon: '⚡',
      badge: 'Sci-Fi',
      req: { coinsCost: 55 },
      reqText: 'Requiere 55 Eurekas 🪙',
    },
    {
      id: 'casual',
      name: 'Sudadera Urbana con Capucha',
      desc: 'Sudadera cómoda con bolsillo canguro y vaqueros clásicos.',
      icon: '👕',
      badge: 'Estilo',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
  ];

  const ROBOT_OUTFITS = [
    {
      id: 'hat',
      name: 'Chistera Victoriana Clásica',
      desc: 'Chistera negra pulida con cinta café sobre titanio naval.',
      icon: '🎩',
      badge: 'Gala',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'mustache',
      name: 'Bigote Distinguido de Latón',
      desc: 'Bigote metálico en placa frontal con visor de telemetría.',
      icon: '🥸',
      badge: 'Vintage',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'futuristic_suit',
      name: 'Armadura Meca Blindada',
      desc: 'Placas reforzadas con propulsores de hombros y reactor azul.',
      icon: '🛡️',
      badge: 'Meca',
      req: { coinsCost: 60 },
      reqText: 'Requiere 60 Eurekas 🪙',
    },
  ];

  // SHOES
  const SHOES_OPTIONS = [
    {
      id: 'shoes_sneakers',
      name: 'Tenis Deportivos con Agujetas',
      desc: 'Suela amortiguada, lengüeta, puntera protectora y cordones 3D.',
      icon: '👟',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'shoes_boots',
      name: 'Botas de Expedición Todo Terreno',
      desc: 'Suela dentada antideslizante, ojales metálicos y cuero reforzado.',
      icon: '🥾',
      req: { minLevel: 2, subject: 'algoritmos' as const },
      reqText: 'Requiere Nivel 2 en Algoritmos',
    },
    {
      id: 'shoes_cyber',
      name: 'Botas Gravitatorias Neón',
      desc: 'Calzado futurista con halo propulsor en la suela y luces guía.',
      icon: '⚡',
      req: { coinsCost: 45 },
      reqText: 'Requiere 45 Eurekas 🪙',
    },
  ];

  // ACCESSORIES
  const ACCESSORIES_OPTIONS = [
    {
      id: '',
      name: 'Sin Accesorio Extra',
      desc: 'Silueta limpia sin aditamentos adicionales.',
      icon: '🚫',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'acc_goggles',
      name: 'Gafas Circulares de Científico',
      desc: 'Montura dorada tridimensional con lentes reflectantes.',
      icon: '👓',
      req: { coinsCost: 40 },
      reqText: 'Requiere 40 Eurekas 🪙',
    },
    {
      id: 'acc_cap',
      name: 'Gorra Deportiva con Visera',
      desc: 'Gorra atlética curva con ajuste ergonómico sobre la cabeza.',
      icon: '🧢',
      req: { minLevel: 2, subject: 'algoritmos' as const },
      reqText: 'Requiere Nivel 2 en Algoritmos',
    },
    {
      id: 'acc_backpack',
      name: 'Mochila de Explorador',
      desc: 'Mochila de campo en la espalda con correas y hebillas.',
      icon: '🎒',
      req: { minLevel: 3, subject: 'matematicas' as const },
      reqText: 'Requiere Nivel 3 en Matemáticas',
    },
  ];

  // SPECIAL UNLOCKABLES
  const SPECIAL_UNLOCKABLES = [
    {
      id: '',
      name: 'Ninguno',
      desc: 'Sin efecto especial activo.',
      icon: '🚫',
      req: { free: true },
      reqText: 'Desbloqueado',
    },
    {
      id: 'unlockable_crown',
      name: 'Corona Estelar de Campeón',
      desc: 'Corona dorada flotante de 5 puntas reservada para estudiantes destacados.',
      icon: '👑',
      req: { minLevel: 4, subject: 'matematicas' as const },
      reqText: 'Requiere Nivel 4 en Matemáticas',
    },
    {
      id: 'unlockable_halo',
      name: 'Aureola Cósmica Flotante',
      desc: 'Anillo de plasma estelar que gira levitando sobre la cabeza.',
      icon: '✨',
      req: { coinsCost: 75 },
      reqText: 'Requiere 75 Eurekas 🪙',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300 select-none pb-14">
      {/* Top Header Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🎨
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-fun block">
                Taller de Avatares 3D • EDUQUEST
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Guardado en Perfil Real
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Personalización de Personaje 3D
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Gira en 360°, prueba animaciones reales (caminar, parpadear, celebrar) y crea tu avatar tridimensional.
            </p>
          </div>
        </div>

        {/* Eurekas & Save Button */}
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

          <GameButton
            variant="accent"
            size="md"
            onClick={handleSaveAvatar}
            icon={<Save className="w-4 h-4 fill-white" />}
          >
            <span>Guardar en Mi Perfil</span>
          </GameButton>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-lg border border-emerald-400 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 font-fun font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      )}

      {/* Main Grid: Left 3D Viewport (360° Inspection) + Right Customization Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: 3D VIRTUAL STUDIO (360° REAL MODEL)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-5 border-3 border-sky-300/60 shadow-2xl flex flex-col items-center justify-between text-white relative overflow-hidden min-h-[620px]">
          {/* Subtle Ambient Studio Light Background */}
          <div className="absolute top-0 inset-x-0 h-44 bg-radial from-sky-400/20 to-transparent pointer-events-none" />

          {/* Top 3D Status Bar */}
          <div className="w-full flex items-center justify-between z-10 mb-1">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-fun">
              <span className="text-amber-400">★</span>
              <span>Vista 360° Rotativa (Arrastra para girar)</span>
            </div>

            <div className="text-xs text-sky-300 font-mono font-bold">
              {draftAvatar.characterType === 'girl'
                ? '👧 Niña 3D'
                : draftAvatar.characterType === 'robot'
                ? '🤖 Robot 3D'
                : '👦 Niño 3D'}
            </div>
          </div>

          {/* 3D Real Model Canvas */}
          <div className="relative flex items-center justify-center w-full z-10 my-1">
            <Avatar3D
              avatarConfig={draftAvatar}
              interactive={true}
              showControlsBar={false}
              size="xl"
              activeGestureProp={currentGesture}
              cameraPreset={cameraZoomMode}
              onGestureChange={(g) => setCurrentGesture(g)}
            />
          </div>

          {/* Camera Focus & Controls Bottom Dock */}
          <div className="w-full z-10 space-y-2.5 mt-2 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            {/* Camera Presets */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-fun">
                Enfoque de Cámara:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    audio.playPop();
                    setCameraZoomMode('full');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-fun font-bold transition cursor-pointer ${
                    cameraZoomMode === 'full'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Completo
                </button>
                <button
                  onClick={() => {
                    audio.playPop();
                    setCameraZoomMode('face');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-fun font-bold transition cursor-pointer ${
                    cameraZoomMode === 'face'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Rostro
                </button>
                <button
                  onClick={() => {
                    audio.playPop();
                    setCameraZoomMode('torso');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-fun font-bold transition cursor-pointer ${
                    cameraZoomMode === 'torso'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Ropa
                </button>
                <button
                  onClick={() => {
                    audio.playPop();
                    setCameraZoomMode('shoes');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-fun font-bold transition cursor-pointer ${
                    cameraZoomMode === 'shoes'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Calzado
                </button>
              </div>
            </div>

            {/* Live Animation Driver Buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-fun block mb-1.5">
                Probar Animaciones en Vivo:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    audio.playCharacterInteract();
                    setCurrentGesture('wave');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'wave'
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Saludar con la mano"
                >
                  <span>👋</span> Saludar
                </button>

                <button
                  onClick={() => {
                    audio.playCharacterInteract();
                    setCurrentGesture('walk');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'walk'
                      ? 'bg-indigo-500 text-white border-indigo-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Caminar con ciclo de marcha real"
                >
                  <span>🚶</span> Caminar
                </button>

                <button
                  onClick={() => {
                    audio.playCharacterInteract();
                    setCurrentGesture('celebrate');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'celebrate'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Celebrar con salto y brazos arriba"
                >
                  <span>🎉</span> Celebrar
                </button>

                <button
                  onClick={() => {
                    audio.playCharacterInteract();
                    setCurrentGesture('concentrate');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'concentrate'
                      ? 'bg-purple-500 text-white border-purple-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Mano al mentón en concentración"
                >
                  <span>🤔</span> Pensar
                </button>

                <button
                  onClick={() => {
                    audio.playPop();
                    setCurrentGesture('achievement');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'achievement'
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Reaccionar con pose triunfante a logros"
                >
                  <span>🏆</span> Logro
                </button>

                <button
                  onClick={() => {
                    audio.playPop();
                    setCurrentGesture('breathe');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'breathe'
                      ? 'bg-teal-500 text-white border-teal-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Respiración profunda consciente"
                >
                  <span>🌬️</span> Respirar
                </button>

                <button
                  onClick={() => {
                    audio.playPop();
                    setCurrentGesture('lookAround');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'lookAround'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Mover la cabeza observando alrededor"
                >
                  <span>👀</span> Mirar
                </button>

                <button
                  onClick={() => {
                    audio.playPop();
                    setCurrentGesture('idle');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer border flex items-center justify-center gap-1 ${
                    currentGesture === 'idle'
                      ? 'bg-slate-600 text-white border-slate-500'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                  title="Postura neutral de reposo"
                >
                  <span>🧍</span> Reposo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CUSTOMIZATION WORKSHOP TABS                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-col space-y-4">
          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-sky-100">
            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('character');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'character'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>1. Personaje</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('hair');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'hair'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>2. Peinados</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('face_eyes');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'face_eyes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3. Rostro y Ojos</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('outfit');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'outfit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>4. Ropa</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('colors');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'colors'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>5. Colores</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('shoes');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'shoes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <span>👟</span>
              <span>6. Calzado</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('accessories');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'accessories'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <span>🎒</span>
              <span>7. Accesorios</span>
            </button>

            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('unlockables');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-fun font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'unlockables'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>8. Especiales</span>
            </button>
          </div>

          {/* TAB 1: SELECCIÓN DE PERSONAJE PRINCIPAL */}
          {activeTab === 'character' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  Selecciona tu Avatar 3D
                </h3>
                <p className="text-xs text-slate-500">
                  Los 3 personajes de EDUQUEST cuentan con modelos tridimensionales volumétricos completos y esqueleto articulado.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Niño */}
                <div
                  onClick={() => handleSelectCharacter('boy')}
                  className={`p-4 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                    draftAvatar.characterType === 'boy'
                      ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-300'
                      : 'border-slate-200 bg-slate-50/70 hover:border-sky-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50 border border-sky-200/60 flex items-center justify-center p-2 relative shadow-inner">
                      <img
                        src="/public/assets/aistudio/image_d659f8a6.png"
                        alt="Niño 3D"
                        className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-sky-800 shadow-xs">
                        👦 Niño
                      </span>
                    </div>
                    <div>
                      <h4 className="font-fun font-bold text-base text-slate-900">Niño Explorador</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Cabello castaño en puntas, camiseta azul con insignia blanca, rostro 3D con ojos oscuros y zapatillas deportivas.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Disponible</span>
                    {draftAvatar.characterType === 'boy' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Seleccionado
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-sky-600 hover:underline">
                        Elegir Niño
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Niña */}
                <div
                  onClick={() => handleSelectCharacter('girl')}
                  className={`p-4 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                    draftAvatar.characterType === 'girl'
                      ? 'border-pink-500 bg-pink-50/90 ring-2 ring-pink-300'
                      : 'border-slate-200 bg-slate-50/70 hover:border-pink-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-pink-100 to-rose-50 border border-pink-200/60 flex items-center justify-center p-2 relative shadow-inner">
                      <img
                        src="/public/assets/aistudio/image_9e4f2ad9.png"
                        alt="Niña 3D"
                        className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-pink-800 shadow-xs">
                        👧 Niña
                      </span>
                    </div>
                    <div>
                      <h4 className="font-fun font-bold text-base text-slate-900">Niña Aventurera</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Cabello morado con dos moños espaciales y diadema cian, mejillas sonrosadas vibrantes y traje atlético.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Disponible</span>
                    {draftAvatar.characterType === 'girl' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Seleccionada
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-pink-600 hover:underline">
                        Elegir Niña
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Robot */}
                <div
                  onClick={() => handleSelectCharacter('robot')}
                  className={`p-4 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                    draftAvatar.characterType === 'robot'
                      ? 'border-cyan-500 bg-cyan-50/90 ring-2 ring-cyan-300'
                      : 'border-slate-200 bg-slate-50/70 hover:border-cyan-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-cyan-100 to-slate-100 border border-cyan-200/60 flex items-center justify-center p-2 relative shadow-inner">
                      <img
                        src="/public/assets/aistudio/image_2afa485a.png"
                        alt="Robot 3D"
                        className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-cyan-800 shadow-xs">
                        🤖 Robot
                      </span>
                    </div>
                    <div>
                      <h4 className="font-fun font-bold text-base text-slate-900">Robot Chistera</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Chasis metálico azul marino con sombrero de copa y cinta café, ojos circulares cian y núcleo luminiscente en el pecho.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Disponible</span>
                    {draftAvatar.characterType === 'robot' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Seleccionado
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-cyan-600 hover:underline">
                        Elegir Robot
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEINADOS 3D */}
          {activeTab === 'hair' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  {isRobot
                    ? 'Módulos de Cabezal 3D (Robot Chistera)'
                    : `Estilos de Cabello con Volumen 3D (${isGirl ? 'Niña' : 'Niño'})`}
                </h3>
                <p className="text-xs text-slate-500">
                  Cabello geométrico modelado en 3D con volumen real, flequillos, mechones y sombras sobre el cráneo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isRobot ? ROBOT_MODULES : isGirl ? GIRL_HAIRSTYLES : BOY_HAIRSTYLES).map(
                  (style) => {
                    const unlocked = isUnlocked(style.req);
                    const isSelected = draftAvatar.hairstyleId === style.id;

                    return (
                      <div
                        key={style.id}
                        onClick={() => handleSelectHairstyle(style.id, style.req)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300'
                            : unlocked
                            ? 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                            : 'border-slate-200 bg-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                            {style.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-fun font-bold text-xs text-slate-900">
                                {style.name}
                              </span>
                              {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              {style.desc}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold ${
                              unlocked ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {style.reqText}
                          </span>
                          {isSelected && (
                            <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Puesto
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Hair Color Selection */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-fun font-bold text-xs text-slate-800 block mb-2">
                  {isRobot ? 'Tono de Luces de Cabezal:' : 'Color del Cabello:'}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {HAIR_COLORS.map((c) => {
                    const isSelected = draftAvatar.hairColor === c.hex;
                    return (
                      <button
                        key={c.hex}
                        onClick={() => handleSelectHairColor(c.hex)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-slate-700">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROSTRO, OJOS Y PIEL */}
          {activeTab === 'face_eyes' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  Rostro Tridimensional, Ojos e Iris
                </h3>
                <p className="text-xs text-slate-500">
                  Ojos con esclera, iris radial procedural, pupilas, reflejos, cejas y párpados para parpadear.
                </p>
              </div>

              {/* Tono de Piel */}
              <div className="space-y-2">
                <span className="font-fun font-bold text-xs text-slate-800 block">
                  {isRobot ? 'Tono del Chasis Metálico:' : 'Tono de Piel:'}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {SKIN_TONES.map((t) => {
                    const isSelected = draftAvatar.skinColor === t.hex;
                    return (
                      <button
                        key={t.hex}
                        onClick={() => handleSelectSkinColor(t.hex)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: t.hex }}
                        />
                        <span className="text-xs text-slate-700">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color de Ojos / Iris */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-fun font-bold text-xs text-slate-800 block">
                  {isRobot ? 'Color de Sensores Ópticos / Ojos:' : 'Color de Iris en Ojos 3D:'}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {EYE_COLORS.map((e) => {
                    const isSelected = draftAvatar.eyeColor === e.hex;
                    return (
                      <button
                        key={e.hex}
                        onClick={() => handleSelectEyeColor(e.hex)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: e.hex }}
                        />
                        <span className="text-xs text-slate-700">{e.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expresiones Faciales */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-fun font-bold text-xs text-slate-800 block">
                  Expresión Facial de Reposo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'happy', name: 'Feliz y Amigable', icon: '😊' },
                    { id: 'victory', name: 'Victoria y Entusiasmo', icon: '😁' },
                    { id: 'thinking', name: 'Pensativo / Curioso', icon: '🤔' },
                    { id: 'curious', name: 'Atento / Analítico', icon: '🧐' },
                    { id: 'wink', name: 'Guiño Pícaro', icon: '😉' },
                  ].map((exp) => {
                    const isSelected = draftAvatar.expression === exp.id;
                    return (
                      <button
                        key={exp.id}
                        onClick={() => handleSelectExpression(exp.id as any)}
                        className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{exp.icon}</span>
                        <span className="text-xs">{exp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROPA Y ATUENDOS */}
          {activeTab === 'outfit' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  Atuendos y Vestimentas ({isRobot ? 'Robot' : isGirl ? 'Niña' : 'Niño'})
                </h3>
                <p className="text-xs text-slate-500">
                  Prendas tridimensionales con bolsillos, cinturones con hebilla, solapas y cuello.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isRobot ? ROBOT_OUTFITS : OUTFITS).map((outfit) => {
                  const unlocked = isUnlocked(outfit.req);
                  const isSelected = draftAvatar.outfitId === outfit.id;

                  return (
                    <div
                      key={outfit.id}
                      onClick={() => handleSelectOutfit(outfit.id, outfit.req)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300'
                          : unlocked
                          ? 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{outfit.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {outfit.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-fun font-bold text-xs text-slate-900">
                            {outfit.name}
                          </span>
                          {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {outfit.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            unlocked ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {outfit.reqText}
                        </span>
                        {isSelected && (
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Equipado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: COLORES DE VESTIMENTA Y PANTALONES */}
          {activeTab === 'colors' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  Colores de Ropa y Pantalón
                </h3>
                <p className="text-xs text-slate-500">
                  Personaliza la prenda superior y el pantalón/falda en tiempo real.
                </p>
              </div>

              {/* Ropa Superior */}
              <div>
                <span className="font-fun font-bold text-xs text-slate-800 block mb-2">
                  Color de Prenda Superior:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CLOTHING_COLORS.map((c) => {
                    const isSelected = draftAvatar.suitColor === c.hex;
                    return (
                      <button
                        key={c.hex}
                        onClick={() => handleSelectSuitColor(c.hex)}
                        className={`p-2 rounded-xl border-2 transition cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-slate-800 truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pantalones */}
              <div className="pt-3 border-t border-slate-100">
                <span className="font-fun font-bold text-xs text-slate-800 block mb-2">
                  Color de Pantalón / Mallas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PANTS_COLORS.map((p) => {
                    const isSelected = draftAvatar.pantsColor === p.hex;
                    return (
                      <button
                        key={p.hex}
                        onClick={() => handleSelectPantsColor(p.hex)}
                        className={`p-2 rounded-xl border-2 transition cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-xs text-slate-800 truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CALZADO */}
          {activeTab === 'shoes' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  Calzado 3D con Suela, Agujetas y Puntera
                </h3>
                <p className="text-xs text-slate-500">
                  Modelos tridimensionales con suela de goma, lengüeta y agujetas para pisar firme en las islas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SHOES_OPTIONS.map((shoe) => {
                  const unlocked = isUnlocked(shoe.req);
                  const isSelected = draftAvatar.shoesId === shoe.id;

                  return (
                    <div
                      key={shoe.id}
                      onClick={() => handleSelectShoes(shoe.id, shoe.req)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300'
                          : unlocked
                          ? 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                          {shoe.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-fun font-bold text-xs text-slate-900">
                              {shoe.name}
                            </span>
                            {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {shoe.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            unlocked ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {shoe.reqText}
                        </span>
                        {isSelected && (
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Puesto
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Color del Calzado */}
              <div className="pt-3 border-t border-slate-100">
                <span className="font-fun font-bold text-xs text-slate-800 block mb-2">
                  Color del Calzado:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: 'Blanco Clásico', hex: '#f8fafc' },
                    { name: 'Azul Real', hex: '#1d4ed8' },
                    { name: 'Rojo Carmesí', hex: '#dc2626' },
                    { name: 'Negro Carbón', hex: '#0f172a' },
                    { name: 'Oro Neón', hex: '#f59e0b' },
                  ].map((sc) => {
                    const isSelected = draftAvatar.shoesColor === sc.hex;
                    return (
                      <button
                        key={sc.hex}
                        onClick={() => handleSelectShoesColor(sc.hex)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: sc.hex }}
                        />
                        <span className="text-xs text-slate-700">{sc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ACCESORIOS */}
          {activeTab === 'accessories' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900">
                  Accesorios y Equipamiento de Expedición
                </h3>
                <p className="text-xs text-slate-500">
                  Gafas con montura 3D y cristales transparentes, gorras y mochilas de campo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCESSORIES_OPTIONS.map((acc) => {
                  const unlocked = isUnlocked(acc.req);
                  const isSelected = draftAvatar.accessoryId === acc.id;

                  return (
                    <div
                      key={acc.id || 'none'}
                      onClick={() => handleSelectAccessory(acc.id, acc.req)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300'
                          : unlocked
                          ? 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                          {acc.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-fun font-bold text-xs text-slate-900">
                              {acc.name}
                            </span>
                            {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {acc.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            unlocked ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {acc.reqText}
                        </span>
                        {isSelected && (
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Equipado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: ELEMENTOS ESPECIALES DESBLOQUEABLES */}
          {activeTab === 'unlockables' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Elementos Especiales Desbloqueables</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Premios prestigiosos que se desbloquean al dominar niveles académicos o reunir Eurekas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPECIAL_UNLOCKABLES.map((unl) => {
                  const unlocked = isUnlocked(unl.req);
                  const isSelected = draftAvatar.specialUnlockableId === unl.id;

                  return (
                    <div
                      key={unl.id || 'none'}
                      onClick={() => handleSelectUnlockable(unl.id, unl.req)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300'
                          : unlocked
                          ? 'border-slate-200 bg-slate-50/60 hover:border-amber-300'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-amber-200">
                          {unl.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-fun font-bold text-xs text-slate-900">
                              {unl.name}
                            </span>
                            {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {unl.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            unlocked ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {unl.reqText}
                        </span>
                        {isSelected && (
                          <span className="text-amber-700 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                audio.playPop();
                onBackToHome();
              }}
              className="px-4 py-2 text-xs font-fun font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ← Volver a las Islas
            </button>

            <GameButton
              variant="accent"
              size="md"
              onClick={handleSaveAvatar}
              icon={<Save className="w-4 h-4 fill-white" />}
            >
              <span>Guardar Mi Personaje</span>
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};
