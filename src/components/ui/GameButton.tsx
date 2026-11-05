import React, { useState } from 'react';
import { audio } from '../../services/audioService';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'ghost' | 'math' | 'code' | 'reading';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  isUnlocked?: boolean;
  playSound?: boolean;
  soundType?: 'pop' | 'success' | 'drop' | 'error';
  fullWidth?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  isSuccess = false,
  isError = false,
  isUnlocked = false,
  playSound = true,
  soundType = 'pop',
  fullWidth = false,
  children,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const [clickedEffect, setClickedEffect] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (playSound) {
      if (soundType === 'pop') audio.playPop();
      else if (soundType === 'success') audio.playBalanceSuccess();
      else if (soundType === 'drop') audio.playPieceDrop();
      else if (soundType === 'error') audio.playMismatch();
    }

    setClickedEffect(true);
    setTimeout(() => setClickedEffect(false), 300);

    onClick?.(e);
  };

  // Base video-game tactile button style
  // - 3D pressable depth with border-b-4 (or border-b-[3px])
  // - Hover: lifts up slightly (-translate-y-0.5) and deepens shadow
  // - Active: pushes down (translate-y-1, border-b-0 or border-b-2)
  // - Smooth transitions with ease-out
  // - Motion reduce compliant
  const baseStyles =
    'relative inline-flex items-center justify-center font-fun font-bold select-none cursor-pointer tracking-wide transition-all duration-200 ease-out focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-sky-400 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none motion-reduce:transition-none motion-reduce:transform-none';

  // Variants styling
  const variantStyles = {
    // Primary: high-visibility vibrant sky/indigo gamer button with 3D bottom bevel
    primary:
      'bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 text-white border-b-4 border-sky-800 shadow-md hover:shadow-lg shadow-sky-600/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Secondary: clean soft surface, subtle border, quiet look
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200/90 border-b-4 border-b-slate-300 shadow-xs hover:shadow-md text-slate-800 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Accent / Eurekas (Amber gold)
    accent:
      'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 border-b-4 border-amber-700 shadow-md hover:shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Success: emerald
    success:
      'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-b-4 border-emerald-800 shadow-md hover:shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Danger: coral red
    danger:
      'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white border-b-4 border-rose-800 shadow-md hover:shadow-lg shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Math specific emerald/teal
    math:
      'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-b-4 border-emerald-800 shadow-md hover:shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Code specific electric blue/indigo
    code:
      'bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white border-b-4 border-indigo-800 shadow-md hover:shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Reading specific rose/purple
    reading:
      'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white border-b-4 border-rose-800 shadow-md hover:shadow-lg shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
    
    // Ghost
    ghost:
      'bg-transparent hover:bg-slate-100/70 text-slate-700 hover:text-slate-900 border-none shadow-none hover:-translate-y-0.5 active:translate-y-0',
  }[variant];

  // Sizes styling
  const sizeStyles = {
    xs: 'text-[11px] px-2.5 py-1 rounded-xl gap-1.5 min-h-[30px]',
    sm: 'text-xs px-3.5 py-1.5 rounded-xl gap-1.5 min-h-[36px]',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-2xl gap-2 min-h-[42px]',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-2xl gap-2.5 min-h-[48px]',
    icon: 'p-2.5 rounded-2xl min-h-[40px] min-w-[40px] justify-center',
  }[size];

  // Animation states: error wobble, unlock shimmer, success sparkle
  const stateStyles = [
    isError ? 'animate-shake ring-2 ring-rose-400' : '',
    isSuccess ? 'ring-3 ring-emerald-400 shadow-emerald-400/50 shadow-lg' : '',
    isUnlocked ? 'animate-pulse-glow ring-2 ring-amber-300' : '',
    isLoading ? 'cursor-wait opacity-80' : '',
    fullWidth ? 'w-full' : '',
    clickedEffect ? 'scale-[0.98]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${stateStyles} ${className} group`}
      {...props}
    >
      {/* Glossy top shine effect for 3D game feel */}
      <span
        aria-hidden="true"
        className="absolute inset-x-2 top-0 h-[30%] bg-gradient-to-b from-white/35 to-transparent rounded-t-xl pointer-events-none"
      />

      {/* Shimmer effect when newly unlocked or highlighted */}
      {isUnlocked && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none rounded-2xl"
        />
      )}

      {/* Loading state indicator */}
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Cargando...</span>
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
          {children}
          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse shrink-0" />
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};
