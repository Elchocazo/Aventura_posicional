import React, { useState } from 'react';
import {
  User,
  Star,
  Flame,
  Award,
  Timer,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  Edit3,
  Check,
  X,
  Play,
  CheckCircle,
  Trophy,
  Zap,
  ShieldAlert,
  Palette,
  Heart,
  BookOpen,
} from 'lucide-react';
import { GradeLevel, GameMode } from '../types';
import { sound } from '../utils/sound';

export interface ProfileDashboardProps {
  playerName: string;
  playerTitle: string;
  playerTheme: string;
  playerMotto: string;
  equippedMascot: string;
  equippedAccessory: string;
  unlockedItems: string[];
  points: number;
  streak: number;
  maxStreak: number;
  solvedCount: number;
  timerSeconds: number;
  currentLevel: GradeLevel;
  currentMode: GameMode;
  onUpdateProfile: (name: string, title: string, theme: string, motto: string) => void;
  onEquipMascot: (mascot: string) => void;
  onEquipAccessory: (accessory: string) => void;
  onOpenStore: () => void;
  onOpenReport: () => void;
  onStartGame: () => void;
  onChangeLevelTab: () => void;
}

const PLAYER_TITLES = [
  'Aventurero del Cálculo',
  'Maestro de las Decenas',
  'Cazador de Estrellas',
  'Genio Posicional',
  'Relámpago de las Sumas',
  'Estratega de Restas',
  'Guardián del Saber',
  'Campeón Matemático',
];

const THEME_OPTIONS = [
  { id: 'sky', name: 'Celeste Brillante', bgClass: 'clay-card-sky', borderClass: 'border-sky-400', badgeBg: 'bg-sky-500' },
  { id: 'purple', name: 'Púrpura Mágico', bgClass: 'clay-card-purple', borderClass: 'border-purple-400', badgeBg: 'bg-purple-500' },
  { id: 'emerald', name: 'Esmeralda Vital', bgClass: 'clay-card-emerald', borderClass: 'border-emerald-400', badgeBg: 'bg-emerald-500' },
  { id: 'amber', name: 'Oro Estelar', bgClass: 'clay-card-amber', borderClass: 'border-amber-400', badgeBg: 'bg-amber-500' },
  { id: 'orange', name: 'Fuego Naranja', bgClass: 'clay-card-orange', borderClass: 'border-orange-400', badgeBg: 'bg-orange-500' },
];

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  playerName,
  playerTitle,
  playerTheme,
  playerMotto,
  equippedMascot,
  equippedAccessory,
  unlockedItems,
  points,
  streak,
  maxStreak,
  solvedCount,
  timerSeconds,
  currentLevel,
  currentMode,
  onUpdateProfile,
  onEquipMascot,
  onEquipAccessory,
  onOpenStore,
  onOpenReport,
  onStartGame,
  onChangeLevelTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playerName);
  const [editTitle, setEditTitle] = useState(playerTitle);
  const [editTheme, setEditTheme] = useState(playerTheme);
  const [editMotto, setEditMotto] = useState(playerMotto);

  // Active theme styling calculation
  const currentThemeObj =
    THEME_OPTIONS.find((t) => t.id === (isEditing ? editTheme : playerTheme)) || THEME_OPTIONS[0];

  const handleSaveProfile = () => {
    sound.playSuccess();
    onUpdateProfile(
      editName.trim() || 'Explorador Matemático',
      editTitle || 'Aventurero del Cálculo',
      editTheme || 'sky',
      editMotto.trim() || '¡Las matemáticas son mi superpoder! 🚀'
    );
    setIsEditing(false);
  };

  // XP level calculation (Level 1: 0-200, Level 2: 200-500, Level 3: 500-1000, Level 4: 1000-2000, Level 5: 2000+)
  const currentXp = points;
  let rankLevel = 1;
  let nextRankXp = 200;
  let prevRankXp = 0;
  let rankName = 'Principiante Posicional';

  if (currentXp >= 2000) {
    rankLevel = 5;
    rankName = 'Leyenda Matemática Supreme 👑';
    prevRankXp = 2000;
    nextRankXp = 5000;
  } else if (currentXp >= 1000) {
    rankLevel = 4;
    rankName = 'Mago del Valor Posicional 🧙‍♂️';
    prevRankXp = 1000;
    nextRankXp = 2000;
  } else if (currentXp >= 500) {
    rankLevel = 3;
    rankName = 'Estratega de los Números 📐';
    prevRankXp = 500;
    nextRankXp = 1000;
  } else if (currentXp >= 200) {
    rankLevel = 2;
    rankName = 'Explorador de Decenas 🎒';
    prevRankXp = 200;
    nextRankXp = 500;
  }

  const xpProgressPercent = Math.min(
    100,
    Math.max(5, Math.round(((currentXp - prevRankXp) / (nextRankXp - prevRankXp)) * 100))
  );

  // Filter mascots and accessories from unlockedItems
  const availableMascots = ['🦉', '🦄', '🚀', '🤖', '🦁'].filter((m) => unlockedItems.includes(m));
  const availableAccessories = ['🎓', '👑', '🎩', '🥽', 'Sin accesorio'].filter(
    (a) => a === 'Sin accesorio' || unlockedItems.includes(a)
  );

  // Dynamic Badges Calculations (12 Achievements with progress)
  const achievements = [
    {
      id: 'first_solve',
      title: 'Primer Acierto',
      desc: 'Resuelve tu primer ejercicio de matemáticas',
      icon: '🎯',
      unlocked: solvedCount >= 1,
      current: Math.min(solvedCount, 1),
      target: 1,
      reward: 50,
    },
    {
      id: 'streak_5',
      title: 'Fuego en Racha',
      desc: 'Alcanza una racha de 5 aciertos seguidos',
      icon: '🔥',
      unlocked: maxStreak >= 5,
      current: Math.min(maxStreak, 5),
      target: 5,
      reward: 100,
    },
    {
      id: 'streak_10',
      title: 'Mente Imparable',
      desc: 'Consigue una racha invicta de 10 aciertos',
      icon: '⚡',
      unlocked: maxStreak >= 10,
      current: Math.min(maxStreak, 10),
      target: 10,
      reward: 200,
    },
    {
      id: 'collector_500',
      title: 'Coleccionista de Estrellas',
      desc: 'Acumula 500 estrellas de experiencia',
      icon: '⭐',
      unlocked: points >= 500,
      current: Math.min(points, 500),
      target: 500,
      reward: 150,
    },
    {
      id: 'collector_1500',
      title: 'Tesorero Real',
      desc: 'Junta 1,500 estrellas de experiencia',
      icon: '💎',
      unlocked: points >= 1500,
      current: Math.min(points, 1500),
      target: 1500,
      reward: 300,
    },
    {
      id: 'master_10',
      title: 'Erudito del Grado',
      desc: 'Completa 10 problemas resueltos',
      icon: '🎓',
      unlocked: solvedCount >= 10,
      current: Math.min(solvedCount, 10),
      target: 10,
      reward: 150,
    },
    {
      id: 'master_25',
      title: 'Gran Maestro Posicional',
      desc: 'Resuelve 25 problemas con éxito',
      icon: '📜',
      unlocked: solvedCount >= 25,
      current: Math.min(solvedCount, 25),
      target: 25,
      reward: 250,
    },
    {
      id: 'master_50',
      title: 'Leyenda del Cálculo',
      desc: 'Completa un total de 50 problemas',
      icon: '👑',
      unlocked: solvedCount >= 50,
      current: Math.min(solvedCount, 50),
      target: 50,
      reward: 500,
    },
    {
      id: 'fashion_3',
      title: 'Estilo Posicional',
      desc: 'Desbloquea 3 ítems en la tienda de mascotas',
      icon: '🛍️',
      unlocked: unlockedItems.length >= 3,
      current: Math.min(unlockedItems.length, 3),
      target: 3,
      reward: 100,
    },
    {
      id: 'fashion_5',
      title: 'Moda Total',
      desc: 'Desbloquea 5 accesorios o mascotas',
      icon: '🎩',
      unlocked: unlockedItems.length >= 5,
      current: Math.min(unlockedItems.length, 5),
      target: 5,
      reward: 200,
    },
    {
      id: 'rank_3',
      title: 'Estratega del Saber',
      desc: 'Alcanza el Nivel 3 de Rango de Experiencia',
      icon: '🏆',
      unlocked: rankLevel >= 3,
      current: Math.min(rankLevel, 3),
      target: 3,
      reward: 200,
    },
    {
      id: 'qr_scanner_master',
      title: 'Escáner Inteligente',
      desc: 'Califica fichas impresas con la Cámara e IA',
      icon: '📷',
      unlocked: points >= 300, // Triggered when scanning or having 300+ XP from sheets
      current: Math.min(points, 300),
      target: 300,
      reward: 300,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const overallLogrosPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="space-y-4 text-slate-800 animate-fadeIn pb-16">
      {/* 1. DASHBOARD HEADER CARD (USER IDENTITY) */}
      <div className="clay-card bg-[#fffdf8] p-5 sm:p-6 text-center space-y-3.5 relative transition-all border-4 border-amber-200/90 shadow-md">
        {/* Top Centered Name + Sparkle + Edit Pencil Icon */}
        <div className="flex items-center justify-center gap-2 font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
          <span>{playerName}</span>
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-300 inline-block shrink-0" />
          <button
            onClick={() => {
              sound.playSelect();
              setEditName(playerName);
              setEditTitle(playerTitle);
              setEditTheme(playerTheme);
              setEditMotto(playerMotto);
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-100/80 rounded-xl transition-all active:scale-95 ml-0.5"
            title="Personalizar Perfil"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        {/* Title / Badge */}
        <p className="font-black text-xs sm:text-sm text-indigo-900 flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{playerTitle}</span>
        </p>

        {/* Motto / Quote */}
        <p className="text-xs sm:text-sm italic font-bold text-slate-600 max-w-sm mx-auto leading-relaxed">
          "{playerMotto}"
        </p>

        {/* Centered Grade & XP Level Pills Row */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          <span className="px-3.5 py-1 rounded-full bg-white text-sky-950 border-2 border-sky-300 font-black text-xs shadow-2xs uppercase tracking-tight">
            {currentLevel}° GRADO ESCOLAR
          </span>
          <span className="px-3.5 py-1 rounded-full bg-amber-300 text-amber-950 border-2 border-amber-400 font-black text-xs shadow-2xs uppercase tracking-tight">
            NIVEL {rankLevel} XP
          </span>
        </div>

        {/* Centered Avatar Display Box & Vestidor Button */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-amber-100 via-sky-100 to-indigo-100 border-4 border-white rounded-3xl flex items-center justify-center text-6xl shadow-[inset_0_3px_6px_rgba(255,255,255,0.9),0_8px_16px_rgba(0,0,0,0.12)]">
            <span className="animate-float">{equippedMascot}</span>
            {equippedAccessory && equippedAccessory !== 'Sin accesorio' && (
              <span className="absolute -bottom-2 -right-2 text-lg bg-amber-300 text-amber-950 font-black rounded-xl px-2 py-0.5 border-2 border-white shadow-md">
                {equippedAccessory}
              </span>
            )}
          </div>

          <button
            onClick={onOpenStore}
            className="mt-3 px-4 py-1.5 text-xs font-black text-purple-900 bg-purple-50 hover:bg-purple-100/90 rounded-full border-2 border-purple-200 shadow-2xs flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
            <span>Vestidor</span>
          </button>
        </div>

        {/* 2. INLINE EDIT FORM / PERSONALIZATION DRAWER */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t-2 border-slate-200/60 bg-white/90 backdrop-blur-xs p-4 rounded-2xl shadow-inner space-y-4 animate-fadeIn">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Personaliza tu Perfil de Jugador</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Player Name */}
              <div>
                <label className="block font-black text-slate-700 mb-1">Tu Nombre o Apodo:</label>
                <input
                  type="text"
                  maxLength={20}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej: Sofia, Mateo, Campeón..."
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl font-black text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Title / Badge */}
              <div>
                <label className="block font-black text-slate-700 mb-1">Título de Perfil:</label>
                <select
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  {PLAYER_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block font-black text-slate-700 mb-1">Color de Tema:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setEditTheme(theme.id)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${theme.badgeBg} ${
                        editTheme === theme.id ? 'border-slate-900 scale-125 ring-2 ring-white' : 'border-white opacity-70'
                      }`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>

              {/* Motto / Quote */}
              <div>
                <label className="block font-black text-slate-700 mb-1">Lema Personal:</label>
                <input
                  type="text"
                  maxLength={50}
                  value={editMotto}
                  onChange={(e) => setEditMotto(e.target.value)}
                  placeholder="Ej: ¡Aprender es mi superpoder!"
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Quick Mascot Selector */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-black text-xs text-slate-700 mb-1.5">
                Mascotas Desbloqueadas:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {availableMascots.map((mascot) => (
                  <button
                    key={mascot}
                    type="button"
                    onClick={() => {
                      sound.playSelect();
                      onEquipMascot(mascot);
                    }}
                    className={`p-2 rounded-2xl border-2 text-2xl transition-all ${
                      equippedMascot === mascot
                        ? 'border-purple-500 bg-purple-100 scale-110 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {mascot}
                  </button>
                ))}

                <button
                  onClick={onOpenStore}
                  className="p-2 rounded-2xl border-2 border-dashed border-purple-300 text-xs font-black text-purple-700 bg-purple-50 hover:bg-purple-100 shrink-0 flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Tienda</span>
                </button>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="clay-btn-white px-4 py-2 font-black text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="clay-btn-emerald px-5 py-2 font-black text-xs flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. XP LEVEL PROGRESS BAR CARD */}
      <div className="clay-card p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-slate-700 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Progreso de Rango: {rankName}</span>
          </span>
          <span className="text-amber-800">
            {currentXp} / {nextRankXp} XP ⭐
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-4 bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden p-0.5 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${xpProgressPercent}%` }}
          />
        </div>
        <p className="text-[10px] font-bold text-slate-500 text-right">
          Faltan {Math.max(0, nextRankXp - currentXp)} XP para el siguiente rango
        </p>
      </div>

      {/* 4. DASHBOARD METRICS KPI GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Points / Stars */}
        <div className="clay-card-amber p-3.5 flex flex-col justify-between gap-1.5 min-h-[90px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-tight">Estrellas / XP</span>
            <span className="text-lg">⭐</span>
          </div>
          <div className="font-black text-2xl text-amber-950 leading-none">
            {points.toLocaleString()}
          </div>
          <span className="text-[10px] font-bold text-amber-800">Acumuladas</span>
        </div>

        {/* Active Practice Timer */}
        <div className="clay-card-sky p-3.5 flex flex-col justify-between gap-1.5 min-h-[90px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-sky-800 uppercase tracking-tight">Tiempo Activo</span>
            <span className="text-lg">⏱️</span>
          </div>
          <div className="font-black text-2xl text-sky-950 leading-none">
            {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
          </div>
          <span className="text-[10px] font-bold text-sky-800">Sesión actual</span>
        </div>

        {/* Current & Best Streak */}
        <div className="clay-card-orange p-3.5 flex flex-col justify-between gap-1.5 min-h-[90px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-orange-800 uppercase tracking-tight">Racha Aciertos</span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="font-black text-2xl text-orange-950 leading-none flex items-baseline gap-1">
            <span>{streak}</span>
            <span className="text-xs font-bold text-orange-800">/ max {maxStreak}</span>
          </div>
          <span className="text-[10px] font-bold text-orange-800">Consecutivos</span>
        </div>

        {/* Exercises Solved */}
        <div className="clay-card-purple p-3.5 flex flex-col justify-between gap-1.5 min-h-[90px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-purple-800 uppercase tracking-tight">Ejercicios</span>
            <span className="text-lg">📊</span>
          </div>
          <div className="font-black text-2xl text-purple-950 leading-none">
            {solvedCount}
          </div>
          <span className="text-[10px] font-bold text-purple-800">Resueltos con éxito</span>
        </div>
      </div>

      {/* 5. ACHIEVEMENTS & BADGES WIDGET ("Insignias y Logros") */}
      <div className="clay-card p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2 font-black text-sm sm:text-base text-slate-900 min-w-0">
            <Award className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="truncate">Insignias y Logros ({unlockedCount}/{achievements.length})</span>
          </div>

          {/* Fixed Alignment Badge */}
          <div className="shrink-0 flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black shadow-2xs">
            <span>🏆</span>
            <span>{unlockedCount} / {achievements.length} Desbloqueados</span>
          </div>
        </div>

        {/* Global Achievements Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-black text-slate-600">
            <span>Progreso General de Desbloqueo</span>
            <span className="text-amber-700">{overallLogrosPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${overallLogrosPercent}%` }}
            />
          </div>
        </div>

        {/* 12 Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {achievements.map((ach) => {
            const itemPercent = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2 ${
                  ach.unlocked
                    ? 'clay-card-amber border-amber-300 shadow-2xs'
                    : 'bg-slate-50/90 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border-2 ${
                      ach.unlocked
                        ? 'bg-amber-200 border-amber-400 text-amber-950'
                        : 'bg-slate-200 border-slate-300 opacity-60 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-black text-xs text-slate-900 truncate">{ach.title}</h4>
                      <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                        +{ach.reward} XP
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight mt-0.5 line-clamp-2">
                      {ach.desc}
                    </p>
                  </div>
                </div>

                {/* Individual Progress & Status */}
                <div className="space-y-1 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span className={ach.unlocked ? 'text-amber-800' : 'text-slate-500'}>
                      {ach.unlocked ? '✓ Completado' : `Progreso: ${ach.current}/${ach.target}`}
                    </span>
                    <span className={ach.unlocked ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>
                      {ach.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.unlocked ? 'bg-amber-500' : 'bg-indigo-400'
                      }`}
                      style={{ width: `${itemPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


