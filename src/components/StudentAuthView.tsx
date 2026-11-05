import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SchoolGrade, Student } from '../types';
import { authService, RegisterFormData } from '../services/authService';
import { audio } from '../services/audioService';
import { GameButton } from './ui/GameButton';
import {
  User,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  GraduationCap,
  ShieldCheck,
  Heart,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface StudentAuthViewProps {
  onAuthenticated: (student: Student, isNewRegistration?: boolean) => void;
  onOpenTeacherDirect?: () => void;
}

type AuthMode = 'login' | 'register' | 'recovery';

export const StudentAuthView: React.FC<StudentAuthViewProps> = ({
  onAuthenticated,
  onOpenTeacherDirect,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    lastName: '',
    age: 9,
    grade: '4to',
    group: '',
    username: '',
    password: '',
    confirmPassword: '',
    guardianEmail: '',
  });

  // Recovery form state
  const [recoveryUsername, setRecoveryUsername] = useState<string>('');
  const [recoveryGuardianEmail, setRecoveryGuardianEmail] = useState<string>('');

  // GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    audio.playPop();
    try {
      const student = await authService.loginWithGoogle();
      audio.playBalanceSuccess();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
      onAuthenticated(student, false);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        audio.playBuzzer();
        setErrorMessage(err.message || 'No se pudo iniciar sesión con Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. HANDLE LOGIN
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!loginUsername.trim()) {
      setErrorMessage('Por favor escribe tu nombre de usuario.');
      audio.playBuzzer();
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor escribe tu contraseña.');
      audio.playBuzzer();
      return;
    }

    setIsLoading(true);
    audio.playPop();

    try {
      const student = await authService.loginWithUsername(loginUsername, loginPassword);
      audio.playBalanceSuccess();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      onAuthenticated(student, false);
    } catch (err: any) {
      audio.playBuzzer();
      setErrorMessage(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. HANDLE REGISTER
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    // Front-end sanity checks
    if (!registerData.name.trim()) {
      setErrorMessage('Ingresa el nombre del estudiante.');
      audio.playBuzzer();
      return;
    }
    if (!registerData.lastName.trim()) {
      setErrorMessage('Ingresa los apellidos del estudiante.');
      audio.playBuzzer();
      return;
    }
    if (!registerData.username.trim()) {
      setErrorMessage('Elige un nombre de usuario para el estudiante.');
      audio.playBuzzer();
      return;
    }
    if (registerData.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      audio.playBuzzer();
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Escríbelas iguales.');
      audio.playBuzzer();
      return;
    }

    setIsLoading(true);
    audio.playPop();

    try {
      const student = await authService.register(registerData);
      audio.playBalanceSuccess();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
      setSuccessNotice(`¡Cuenta creada con éxito para ${student.name}!`);
      setTimeout(() => {
        onAuthenticated(student, true);
      }, 700);
    } catch (err: any) {
      audio.playBuzzer();
      setErrorMessage(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. HANDLE RECOVERY
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!recoveryUsername.trim()) {
      setErrorMessage('Ingresa el nombre de usuario o correo de recuperación.');
      audio.playBuzzer();
      return;
    }

    setIsLoading(true);
    audio.playPop();

    try {
      const msg = await authService.requestPasswordRecovery(
        recoveryUsername,
        recoveryGuardianEmail
      );
      setSuccessNotice(msg);
      audio.playBalanceSuccess();
    } catch (err: any) {
      audio.playBuzzer();
      setErrorMessage(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 relative select-none">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url('/assets/spongebob_background.jpg')`,
        }}
      />
      {/* Soft translucent atmospheric gradient overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-sky-950/40 via-sky-900/25 to-amber-950/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Container Card: Hero Fantasy Visual on Left + Parchment Card on Right */}
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/40 bg-slate-900/60 backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 animate-in zoom-in-95 duration-300">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HERO ILLUSTRATION / ADVENTURE WELCOME (Matching Screenshot)  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 relative p-6 sm:p-10 flex flex-col justify-between text-white overflow-hidden bg-gradient-to-b from-sky-900/60 via-indigo-950/70 to-slate-950/80">
          {/* Subtle warm glow behind */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-sky-500 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl shadow-inner">
                  💡
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-fun tracking-tight text-white drop-shadow-md block leading-tight">
                  Eureka<span className="text-amber-300">Lab</span>
                </span>
                <span className="text-xs font-bold text-sky-200 uppercase tracking-widest block font-fun">
                  Gamificación & Aprendizaje Real
                </span>
              </div>
            </div>
          </div>

          {/* Center Adventure Teaser */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold font-fun backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Acceso Individual Seguro para Alumnos</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-fun text-white leading-tight drop-shadow-lg">
              Tu propia isla de aventuras, ciencia y matemáticas.
            </h1>

            <p className="text-sky-100 text-xs sm:text-sm leading-relaxed font-medium">
              Cada estudiante cuenta con su propia cuenta protegida. Tu avatar 3D, tus monedas Eureka y todas tus misiones superadas se guardan de forma exclusiva en tu perfil personal.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="text-xl block">🔒</span>
                <span className="text-xs font-bold text-white block mt-1">Cuenta Individual</span>
                <span className="text-[10px] text-sky-200">Sin acceso cruzado entre compañeros</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="text-xl block">🪙</span>
                <span className="text-xs font-bold text-white block mt-1">Avance Real</span>
                <span className="text-[10px] text-sky-200">Puntos y misiones 100% personales</span>
              </div>
            </div>
          </div>

          {/* Bottom Security / Children Protection Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protección y Privacidad de Menores</span>
            </div>
            <span className="font-mono text-amber-300/90 font-bold">Grados 3ro a 6to</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PARCHMENT AUTHENTICATION CARD (Matching Prodigy Screenshot)  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 p-5 sm:p-8 bg-[#fdfbf7] flex flex-col justify-between border-l-0 lg:border-l-4 border-amber-900/30">
          <div>
            {/* Top Title of Card */}
            <div className="text-center pb-5 border-b border-amber-200/70">
              <h2 className="text-2xl sm:text-3xl font-black font-fun tracking-tight text-[#0284c7]">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Nuevo Estudiante'}
                {mode === 'recovery' && 'Recuperación de Cuenta'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {mode === 'login' && 'Ingresa tu nombre de usuario y contraseña para entrar a tu isla'}
                {mode === 'register' && 'Crea tu perfil individual para comenzar a ganar Eurekas'}
                {mode === 'recovery' && 'Procedimiento seguro con asistencia de padres o docentes'}
              </p>
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Success Message Toast */}
            {successNotice && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-tight">{successNotice}</span>
              </div>
            )}

            {/* =================================================================== */}
            {/* MODE 1: LOGIN FORM (Usuario + Contraseña, exact to user reference)   */}
            {/* =================================================================== */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-fun">
                    Nombre de Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Ej. alex_saber"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-sm outline-none transition shadow-inner"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        audio.playPop();
                        setMode('recovery');
                        setErrorMessage(null);
                        setSuccessNotice(null);
                      }}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Tu contraseña secreta"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-sm outline-none transition shadow-inner"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Sign In Button (Prodigy Blue Style) */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 active:translate-y-0.5 text-white font-fun font-black text-base tracking-wide border-2 border-sky-600 border-b-4 border-b-sky-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>{isLoading ? 'Comprobando...' : 'Iniciar Sesión'}</span>
                  </button>

                  {/* Google Sign In (Direct native Firebase OAuth) */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 border-b-4 border-b-slate-400 text-slate-700 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Cuenta Google Escolar</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-amber-200"></div>
                    <span className="flex-shrink mx-3 text-xs font-bold text-slate-400 uppercase">o</span>
                    <div className="flex-grow border-t border-amber-200"></div>
                  </div>

                  {/* New Player / Register Button (Prodigy Green Style) */}
                  <button
                    type="button"
                    onClick={() => {
                      audio.playPop();
                      setMode('register');
                      setErrorMessage(null);
                      setSuccessNotice(null);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 active:translate-y-0.5 text-white font-fun font-black text-sm tracking-wide border-2 border-emerald-600 border-b-4 border-b-emerald-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Nuevo Estudiante • Crear Cuenta</span>
                  </button>

                  {/* Quick demo accounts helper */}
                  <div className="pt-2 bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/80 text-[11px] space-y-1.5">
                    <span className="font-bold text-amber-900 block font-fun">
                      💡 Cuentas de demostración rápida:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginUsername('mateo_vargas');
                          setLoginPassword('eureka123');
                          audio.playPop();
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold transition cursor-pointer shadow-xs"
                      >
                        👦 Mateo (4to)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginUsername('sofia_ramos');
                          setLoginPassword('eureka123');
                          audio.playPop();
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold transition cursor-pointer shadow-xs"
                      >
                        👧 Sofía (5to)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginUsername('diego_navarro');
                          setLoginPassword('eureka123');
                          audio.playPop();
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold transition cursor-pointer shadow-xs"
                      >
                        👦 Diego (6to)
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* MODE 2: REGISTER FORM (Nombre, Apellidos, Edad, Grado, Grupo, etc.) */}
            {/* =================================================================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3 max-h-[58vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="Ej. Mateo"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                      required
                    />
                  </div>

                  {/* Apellidos */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      placeholder="Ej. García López"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Edad */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Edad *
                    </label>
                    <input
                      type="number"
                      min={6}
                      max={15}
                      value={registerData.age}
                      onChange={(e) => setRegisterData({ ...registerData, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                      required
                    />
                  </div>

                  {/* Grado Escolar */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Grado *
                    </label>
                    <select
                      value={registerData.grade}
                      onChange={(e) => setRegisterData({ ...registerData, grade: e.target.value as SchoolGrade })}
                      className="w-full px-2 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                    >
                      <option value="3ro">3ro Primaria</option>
                      <option value="4to">4to Primaria</option>
                      <option value="5to">5to Primaria</option>
                      <option value="6to">6to Primaria</option>
                    </select>
                  </div>

                  {/* Grupo escolar (Opcional) */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Grupo (opc)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={registerData.group}
                      onChange={(e) => setRegisterData({ ...registerData, group: e.target.value })}
                      placeholder="Ej. A"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition uppercase"
                    />
                  </div>
                </div>

                {/* Nombre de Usuario */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Nombre de Usuario Único *
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Sin espacios ni símbolos</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        })
                      }
                      placeholder="ej. mateo_explorer"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Contraseñas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Contraseña * (mín 6)
                    </label>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="••••••"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Correo de tutor/padre para recuperación autorizada */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-fun">
                    Correo del Padre o Tutor (Opcional para recuperación)
                  </label>
                  <input
                    type="email"
                    value={registerData.guardianEmail}
                    onChange={(e) => setRegisterData({ ...registerData, guardianEmail: e.target.value })}
                    placeholder="padre_tutor@familia.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-xs outline-none transition"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Permite recuperar la cuenta si el alumno olvida su contraseña.
                  </span>
                </div>

                {/* Submit Register Button */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-fun font-black text-sm tracking-wide border-2 border-emerald-700 border-b-4 border-b-emerald-900 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isLoading ? 'Registrando cuenta...' : '¡Crear Mi Cuenta y Comenzar!'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audio.playPop();
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessNotice(null);
                    }}
                    className="w-full py-2 text-xs font-bold text-slate-600 hover:text-sky-700 hover:underline cursor-pointer"
                  >
                    ¿Ya tienes una cuenta? Iniciar sesión aquí
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* MODE 3: RECOVERY FORM (Procedimiento Autorizado de Recuperación)     */}
            {/* =================================================================== */}
            {mode === 'recovery' && (
              <form onSubmit={handleRecoverySubmit} className="mt-5 space-y-4">
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs text-sky-900 space-y-1">
                  <span className="font-bold block font-fun flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Recuperación Autorizada para Menores
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Para proteger los datos de los estudiantes, el restablecimiento de contraseñas se envía al correo registrado del padre o tutor, o puede ser asistido por el docente a cargo del aula.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-fun">
                    Nombre de Usuario del Alumno
                  </label>
                  <input
                    type="text"
                    value={recoveryUsername}
                    onChange={(e) => setRecoveryUsername(e.target.value)}
                    placeholder="Tu nombre de usuario"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-sm outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-fun">
                    Correo del Padre o Tutor
                  </label>
                  <input
                    type="email"
                    value={recoveryGuardianEmail}
                    onChange={(e) => setRecoveryGuardianEmail(e.target.value)}
                    placeholder="correo@padre-tutor.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f5f2ea] border-2 border-amber-300/80 focus:border-sky-500 focus:bg-white text-slate-900 font-bold text-sm outline-none transition"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-b from-sky-500 to-sky-700 text-white font-fun font-black text-sm tracking-wide border-2 border-sky-700 border-b-4 border-b-sky-900 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Enviando...' : 'Solicitar Restablecimiento'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audio.playPop();
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessNotice(null);
                    }}
                    className="w-full py-2 text-xs font-bold text-slate-600 hover:text-sky-700 hover:underline cursor-pointer"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Footer Links (Matching Prodigy footer: Privacy, Parent Guide, Teacher Direct) */}
          <div className="pt-5 mt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-semibold text-[11px]">EurekaLab • Autenticación Segura</span>
            <div className="flex items-center gap-3">
              {onOpenTeacherDirect && (
                <button
                  type="button"
                  onClick={() => {
                    audio.playPop();
                    onOpenTeacherDirect();
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Acceso Docente</span>
                </button>
              )}
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-400">Protegido por Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
