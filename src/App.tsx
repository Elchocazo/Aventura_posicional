import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { StoryCard } from './components/StoryCard';
import { PositionalBoard } from './components/PositionalBoard';
import { DigitsBank } from './components/DigitsBank';
import { BottomNav } from './components/BottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { OptionsMenuModal } from './components/OptionsMenuModal';
import { ProfileDashboard } from './components/ProfileDashboard';
import { StoreModal } from './components/StoreModal';
import { TeacherReportModal } from './components/TeacherReportModal';
import { VictoryModal } from './components/VictoryModal';
import { WorksheetPrintable } from './components/WorksheetPrintable';
import { SplashScreenOverlay } from './components/SplashScreenOverlay';

const QrScannerModal = lazy(() =>
  import('./components/QrScannerModal').then((m) => ({ default: m.QrScannerModal }))
);
const WorksheetShareModal = lazy(() =>
  import('./components/WorksheetShareModal').then((m) => ({ default: m.WorksheetShareModal }))
);
import { LEVEL_CONFIGS, STORY_THEMES, ALL_COLUMNS, STORE_THEMES } from './data/constants';
import { OperationMode, GradeLevel, GamePhase, PositionalCol, ProblemData, Chip, PlayerProfile, ToastType } from './types';
import { sound } from './utils/sound';
import { initAdMob } from './utils/admob';
import {
  createNewProfile,
  loadProfiles,
  recordErrorInHistory,
  recordSolveInHistory,
  refreshProfileForToday,
  saveProfiles,
  updateMissionsOnSolve,
} from './utils/profiles';
import { App as CapApp } from '@capacitor/app';

const AUTO_SAVE_KEY = 'math_auto_save_state_v2';

export const App: React.FC = () => {
  useEffect(() => {
    initAdMob();
  }, []);

  const initialProfilesData = useRef(loadProfiles());
  const [profiles, setProfiles] = useState<PlayerProfile[]>(initialProfilesData.current.profiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(initialProfilesData.current.activeProfileId);
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [currentLevel, setCurrentLevel] = useState<GradeLevel>(3);
  const [currentMode, setCurrentMode] = useState<OperationMode>('add');
  const [points, setPoints] = useState<number>(activeProfile.points);
  const [totalXp, setTotalXp] = useState<number>(activeProfile.totalXp);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(activeProfile.maxStreak);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
  const totalProblems = 10;
  const [solvedCount, setSolvedCount] = useState(activeProfile.solvedCount);

  const [equippedMascot, setEquippedMascot] = useState<string>(activeProfile.equippedMascot);
  const [equippedAccessory, setEquippedAccessory] = useState<string>(activeProfile.equippedAccessory);
  const [equippedTheme, setEquippedTheme] = useState<string>(activeProfile.equippedTheme || 'theme_sky');
  const [unlockedItems, setUnlockedItems] = useState<string[]>(activeProfile.unlockedItems);

  const [playerName, setPlayerName] = useState(activeProfile.name);
  const [dailyStreak, setDailyStreak] = useState(activeProfile.dailyStreak);
  const [missions, setMissions] = useState(activeProfile.missions);
  const [dailyHistory, setDailyHistory] = useState(activeProfile.dailyHistory);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isTeacherReportOpen, setIsTeacherReportOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isWorksheetShareOpen, setIsWorksheetShareOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.enabled);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [playerTitle, setPlayerTitle] = useState(activeProfile.title);
  const [playerTheme, setPlayerTheme] = useState(activeProfile.theme);
  const [playerMotto, setPlayerMotto] = useState(activeProfile.motto);
  const [printCounter, setPrintCounter] = useState<number>(() => parseInt(localStorage.getItem('math_print_counter') || '1', 10));
  const [toastMessage, setToastMessage] = useState<{ text: string; type: ToastType } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine === false : false
  );
  const [bestTimeSeconds, setBestTimeSeconds] = useState<number | null>(() => {
    const raw = localStorage.getItem('math_best_time_sec');
    return raw ? parseInt(raw, 10) : null;
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('placing');
  const [placedDigits, setPlacedDigits] = useState<Record<string, string>>({});
  const [chips, setChips] = useState<Chip[]>([]);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [incorrectResultCols, setIncorrectResultCols] = useState<PositionalCol[]>([]);

  const showToast = useCallback((text: string, type: ToastType = 'info') => {
    setToastMessage({ text, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sound.setEnabled(next);
      if (next) sound.playSelect();
      return next;
    });
  }, []);

  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
  }, [stopTimer]);

  const generateProblem = useCallback((levelOverride?: GradeLevel, modeOverride?: OperationMode) => {
    const level = levelOverride || currentLevel;
    const mode = modeOverride || currentMode;
    const config = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[3];

    let op = mode;
    if (op === 'mix') op = Math.random() > 0.5 ? 'add' : 'sub';

    const n1raw = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
    const n2raw = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;

    let n1 = n1raw, n2 = n2raw, symbol: '+' | '-' = '+';
    if (op === 'sub') {
      symbol = '-';
      n1 = Math.max(n1raw, n2raw);
      n2 = Math.min(n1raw, n2raw);
    } else {
      symbol = '+';
      n1 = n1raw;
      n2 = n2raw;
    }

    const result = symbol === '+' ? n1 + n2 : n1 - n2;
    const maxDigits = Math.max(n1.toString().length, n2.toString().length, result.toString().length);
    const activeCols = ALL_COLUMNS.slice(ALL_COLUMNS.length - maxDigits);
    const theme = STORY_THEMES[Math.floor(Math.random() * STORY_THEMES.length)];

    const storyText = symbol === '+' ? theme.addStory(n1.toLocaleString(), n2.toLocaleString()) : theme.subStory(n1.toLocaleString(), n2.toLocaleString());

    setProblem({
      num1: n1, num2: n2, operation: symbol, activeCols,
      story: { icon: theme.icon, text: storyText, question: symbol === '+' ? theme.addQuestion : theme.subQuestion }
    });
    setGamePhase('placing');
    setPlacedDigits({});
    setChips([...n1.toString(), ...n2.toString()].sort(() => Math.random() - 0.5).map((v, i) => ({ id: `c${i}`, value: v, used: false })));
    setSelectedChipId(null);
  }, [currentLevel, currentMode]);

  const resetGameProgress = useCallback(() => {
    setCurrentProblemIndex(1);
    setLives(3);
    setStreak(0);
    setTimerSeconds(0);
    startTimer();
    generateProblem();
  }, [generateProblem, startTimer]);

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedStr = localStorage.getItem(AUTO_SAVE_KEY);
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved && saved.problem) {
          setCurrentLevel(saved.currentLevel);
          setCurrentMode(saved.currentMode);
          setPoints(saved.points);
          setLives(saved.lives);
          setStreak(saved.streak);
          setMaxStreak(saved.maxStreak);
          setCurrentProblemIndex(saved.currentProblemIndex);
          setSolvedCount(saved.solvedCount);
          setTimerSeconds(saved.timerSeconds);
          setProblem(saved.problem);
          setGamePhase(saved.gamePhase);
          setPlacedDigits(saved.placedDigits);
          setChips(saved.chips);
          startTimer();
          return;
        }
      } catch (e) { console.error("Error loading save", e); }
    }
    resetGameProgress();
    return () => stopTimer();
  }, [resetGameProgress, startTimer, stopTimer]);

  useEffect(() => {
    if (!problem || showSplash) return;
    const state = { currentLevel, currentMode, points, lives, streak, maxStreak, currentProblemIndex, solvedCount, timerSeconds, problem, gamePhase, placedDigits, chips };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(state));
    localStorage.setItem('math_points', points.toString());
    localStorage.setItem('math_player_name', playerName);
    localStorage.setItem('math_mascot', equippedMascot);
    localStorage.setItem('math_accessory', equippedAccessory);
    localStorage.setItem('math_unlocked', JSON.stringify(unlockedItems));

    setProfiles((prev) => {
      const updated = prev.map((p) =>
        p.id === activeProfileId
          ? {
              ...p,
              name: playerName,
              title: playerTitle,
              theme: playerTheme,
              motto: playerMotto,
              points,
              totalXp,
              equippedMascot,
              equippedAccessory,
              equippedTheme,
              unlockedItems,
              solvedCount,
              maxStreak,
              dailyStreak,
              missions,
              dailyHistory,
            }
          : p
      );
      saveProfiles(updated, activeProfileId);
      return updated;
    });
  }, [
    currentLevel,
    currentMode,
    points,
    totalXp,
    lives,
    streak,
    maxStreak,
    currentProblemIndex,
    solvedCount,
    timerSeconds,
    problem,
    gamePhase,
    placedDigits,
    chips,
    showSplash,
    playerName,
    playerTitle,
    playerTheme,
    playerMotto,
    equippedMascot,
    equippedAccessory,
    equippedTheme,
    unlockedItems,
    dailyStreak,
    missions,
    dailyHistory,
    activeProfileId,
  ]);

  const applyProfileToState = useCallback((profile: PlayerProfile) => {
    setPoints(profile.points);
    setTotalXp(profile.totalXp);
    setMaxStreak(profile.maxStreak);
    setSolvedCount(profile.solvedCount);
    setEquippedMascot(profile.equippedMascot);
    setEquippedAccessory(profile.equippedAccessory);
    setEquippedTheme(profile.equippedTheme || 'theme_sky');
    setUnlockedItems(profile.unlockedItems);
    setPlayerName(profile.name);
    setPlayerTitle(profile.title);
    setPlayerTheme(profile.theme);
    setPlayerMotto(profile.motto);
    setDailyStreak(profile.dailyStreak);
    setMissions(profile.missions);
    setDailyHistory(profile.dailyHistory);
    setStreak(0);
  }, []);

  const handleSwitchProfile = useCallback(
    (profileId: string) => {
      const target = profiles.find((p) => p.id === profileId);
      if (!target) return;
      const { profile: refreshed, streakBonusAwarded } = refreshProfileForToday(target);
      const nextProfiles = profiles.map((p) => (p.id === profileId ? refreshed : p));
      setProfiles(nextProfiles);
      setActiveProfileId(profileId);
      saveProfiles(nextProfiles, profileId);
      applyProfileToState(refreshed);
      if (streakBonusAwarded > 0) {
        showToast(`🔥 ¡Racha de ${refreshed.dailyStreak} días! +${streakBonusAwarded} ⭐ para ${refreshed.name}`, 'success');
      } else {
        showToast(`👋 ¡Hola, ${refreshed.name}!`, 'info');
      }
    },
    [profiles, applyProfileToState, showToast]
  );

  const handleCreateProfile = useCallback(
    (name: string) => {
      const created = createNewProfile(name);
      const nextProfiles = [...profiles, created];
      setProfiles(nextProfiles);
      setActiveProfileId(created.id);
      saveProfiles(nextProfiles, created.id);
      applyProfileToState(created);
      showToast(`🎉 ¡Perfil creado para ${created.name}!`, 'success');
    },
    [profiles, applyProfileToState, showToast]
  );

  const handleDeleteProfile = useCallback(
    (profileId: string) => {
      if (profiles.length <= 1) return;
      const target = profiles.find((p) => p.id === profileId);
      const remaining = profiles.filter((p) => p.id !== profileId);
      const nextActiveId = profileId === activeProfileId ? remaining[0].id : activeProfileId;
      setProfiles(remaining);
      setActiveProfileId(nextActiveId);
      saveProfiles(remaining, nextActiveId);
      if (profileId === activeProfileId) {
        applyProfileToState(remaining[0]);
      }
      showToast(`🗑️ Perfil "${target?.name || ''}" eliminado`, 'info');
    },
    [profiles, activeProfileId, applyProfileToState, showToast]
  );

  const handleClaimMission = useCallback(
    (missionId: string) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission || mission.claimed || mission.progress < mission.target) return;
      setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m)));
      setPoints((p) => p + mission.reward);
      setTotalXp((x) => x + mission.reward);
      showToast(`🎁 ¡Misión completada! +${mission.reward} ⭐`, 'success');
    },
    [missions, showToast]
  );

  const lastBackPressRef = useRef<number>(0);

  // Manejador nativo del boton Atras de Android (con doble toque para evitar salidas accidentales)
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (isWorksheetShareOpen) { setIsWorksheetShareOpen(false); return; }
      if (isOptionsOpen) { setIsOptionsOpen(false); return; }
      if (isProfileOpen) { setIsProfileOpen(false); return; }
      if (isStoreOpen) { setIsStoreOpen(false); return; }
      if (isTeacherReportOpen) { setIsTeacherReportOpen(false); return; }
      if (isQrScannerOpen) { setIsQrScannerOpen(false); return; }
      if (isVictoryOpen) { setIsVictoryOpen(false); return; }
      if (isWelcomeOpen) { setIsWelcomeOpen(false); return; }

      if (gamePhase === 'calculating' || gamePhase === 'complete') {
        setGamePhase('placing');
        return;
      }

      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        CapApp.exitApp();
      } else {
        lastBackPressRef.current = now;
        showToast('👋 Toca Atrás otra vez para salir', 'info');
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [
    isWorksheetShareOpen,
    isOptionsOpen,
    isProfileOpen,
    isStoreOpen,
    isTeacherReportOpen,
    isQrScannerOpen,
    isVictoryOpen,
    isWelcomeOpen,
    gamePhase,
    showToast,
  ]);

  const handleFinishSplash = useCallback(() => {
    setShowSplash(false);
    if (playerName === 'Explorador') {
      setIsWelcomeOpen(true);
    } else if (initialProfilesData.current.streakBonusAwarded > 0) {
      showToast(
        `🔥 ¡Racha de ${dailyStreak} días seguidos! Ganaste +${initialProfilesData.current.streakBonusAwarded} ⭐`,
        'success'
      );
    }
    sound.playSuccess();
  }, [playerName, dailyStreak, showToast]);

  const handleCellClick = (row: string, col: PositionalCol) => {
    const key = `${row}_${col}`;
    const currentValue = placedDigits[key];

    if (selectedChipId) {
      // Obtener el valor numérico de la ficha (sea de colocación o de resultado res_digit_0..9)
      let chipValue = '';
      if (selectedChipId.startsWith('res_digit_')) {
        chipValue = selectedChipId.replace('res_digit_', '');
      } else {
        const found = chips.find(c => c.id === selectedChipId);
        if (found) chipValue = found.value;
      }

      if (!chipValue) return;

      if (row === 'carry' && currentValue && currentValue.length === 1) {
        setPlacedDigits(prev => ({ ...prev, [key]: currentValue + chipValue }));
      } else {
        if (currentValue && !selectedChipId.startsWith('res_digit_')) {
          setChips(prev => prev.map(c => c.value === currentValue.slice(-1) && c.used ? { ...c, used: false } : c));
        }
        setPlacedDigits(prev => ({ ...prev, [key]: chipValue }));
      }

      if (!selectedChipId.startsWith('res_digit_')) {
        setChips(prev => prev.map(c => c.id === selectedChipId ? { ...c, used: true } : c));
      }

      setSelectedChipId(null);
      sound.playPop();
    } else if (currentValue) {
      // Si se toca una casilla que ya tiene un valor (para borrarlo)
      setPlacedDigits(prev => {
        const n = { ...prev };
        delete n[key];
        return n;
      });

      if (!key.startsWith('result_')) {
        setChips(prev => {
          let restored = false;
          return prev.map(c => {
            if (!restored && c.used && c.value === currentValue.slice(-1)) {
              restored = true;
              return { ...c, used: false };
            }
            return c;
          });
        });
      }
      sound.playSelect();
    }
  };

  const handleCheckResult = () => {
    if (!problem) return;
    let resStr = '';
    problem.activeCols.forEach(col => resStr += placedDigits[`result_${col}`] || '0');
    const userResult = parseInt(resStr, 10) || 0;
    const expected = problem.operation === '+' ? problem.num1 + problem.num2 : problem.num1 - problem.num2;
    if (userResult === expected) {
      sound.playSuccess();
      setGamePhase('complete');
      const winPoints = 100 + (streak * 20);
      const nextStreak = streak + 1;
      setPoints(p => p + winPoints);
      setTotalXp(x => x + winPoints);
      setStreak(nextStreak);
      setMaxStreak(m => Math.max(m, nextStreak));
      setSolvedCount(s => s + 1);
      setDailyHistory(h => recordSolveInHistory(h, winPoints));
      setMissions(prev => {
        const { missions: updated, newlyCompletedTitles } = updateMissionsOnSolve(prev, nextStreak);
        if (newlyCompletedTitles.length > 0) {
          setTimeout(() => {
            showToast(`🎯 ¡Misión lista en tu Perfil: ${newlyCompletedTitles[0]}!`, 'info');
          }, 1600);
        }
        return updated;
      });
      showToast(`¡Excelente! +${winPoints} ⭐`, 'success');
    } else {
      sound.playError();
      setDailyHistory(h => recordErrorInHistory(h));
      setIncorrectResultCols(problem.activeCols);
      setTimeout(() => setIncorrectResultCols([]), 1500);
      setLives(l => {
        const next = Math.max(0, l - 1);
        if (next === 0) { showToast("¡Vuelve a empezar! 💪", "error"); setTimeout(resetGameProgress, 2000); }
        else { showToast("¡Revisa el cálculo! ❤️", "error"); }
        return next;
      });
      setStreak(0);
    }
  };

  const activeBgClass =
    STORE_THEMES.find((t) => t.id === equippedTheme)?.bgClass || 'bg-sky-50';
  const hasClaimableMission = missions.some((m) => !m.claimed && m.progress >= m.target);
  const currentActiveTab = isStoreOpen
    ? 'store'
    : isProfileOpen
    ? 'profile'
    : isTeacherReportOpen
    ? 'report'
    : isOptionsOpen
    ? 'levels'
    : 'game';

  return (
    <div
      className={`min-h-screen h-full w-full ${activeBgClass} text-slate-900 pb-28 flex flex-col items-center overflow-y-auto overflow-x-hidden touch-pan-y transition-colors duration-300`}
    >
      {showSplash && <SplashScreenOverlay onFinish={handleFinishSplash} />}

      <Header
        points={points}
        lives={lives}
        streak={streak}
        mascot={equippedMascot}
        accessory={equippedAccessory}
        playerName={playerName}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsOptionsOpen(true)}
        onOpenStore={() => setIsStoreOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />

      <main className="w-full max-w-lg px-3 mt-4 flex-1 flex flex-col">
        {isOffline && (
          <div className="mb-3 px-3.5 py-2 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-2xs">
            <span>📡 Modo sin conexión — puedes seguir jugando normalmente</span>
          </div>
        )}
        {toastMessage && (
          <div
            style={{ top: 'max(env(safe-area-inset-top, 0px), 16px)' }}
            className={`fixed left-1/2 -translate-x-1/2 z-[70] max-w-[92vw] px-5 py-3 rounded-2xl shadow-2xl text-white font-black text-xs sm:text-sm text-center border-2 border-white/40 transition-all animate-bounce ${
              toastMessage.type === 'error'
                ? 'bg-rose-500'
                : toastMessage.type === 'warning'
                ? 'bg-amber-500'
                : toastMessage.type === 'info'
                ? 'bg-sky-600'
                : 'bg-emerald-500'
            }`}
          >
            {toastMessage.text}
          </div>
        )}

        {!problem ? (
          <div className="m-auto text-center flex flex-col items-center">
            <div className="w-16 h-16 border-8 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4" />
            <p className="font-black text-sky-800 animate-pulse">Cargando aventura...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <StoryCard
              problem={problem}
              currentProblemIndex={currentProblemIndex}
              gradeLabel={LEVEL_CONFIGS[currentLevel].label}
              gamePhase={gamePhase}
            />
            <DigitsBank chips={chips} selectedChipId={selectedChipId} onSelectChip={setSelectedChipId} gamePhase={gamePhase} />
            <PositionalBoard num1={problem.num1} num2={problem.num2} operation={problem.operation} activeCols={problem.activeCols} gamePhase={gamePhase} placedDigits={placedDigits} selectedDigit={selectedChipId ? chips.find(c => c.id === selectedChipId)?.value || null : null} onCellClick={handleCellClick} incorrectResultCols={incorrectResultCols} />

            <div className="flex gap-3 justify-center py-4">
              <button onClick={resetGameProgress} className="bg-slate-200 hover:bg-slate-300 p-4 rounded-3xl font-black text-xl shadow-md active:scale-95 transition-all">🔄</button>
              {gamePhase === 'placing' && (
                <button onClick={() => { sound.playSuccess(); setGamePhase('calculating'); setSelectedChipId(null); }} className="bg-gradient-to-r from-sky-400 to-blue-600 text-white px-8 py-4 rounded-3xl font-black text-lg shadow-xl flex-1 active:scale-95 transition-all">¡Acomodado! 🚀</button>
              )}
              {gamePhase === 'calculating' && (
                <button onClick={handleCheckResult} className="bg-gradient-to-r from-emerald-400 to-teal-600 text-white px-8 py-4 rounded-3xl font-black text-lg shadow-xl flex-1 active:scale-95 transition-all">¡Comprobar! ✅</button>
              )}
              {gamePhase === 'complete' && (
                <button
                  onClick={() => {
                    if (currentProblemIndex >= totalProblems) {
                      stopTimer();
                      const beatRecord = bestTimeSeconds === null || timerSeconds < bestTimeSeconds;
                      setIsNewRecord(beatRecord);
                      if (beatRecord) {
                        setBestTimeSeconds(timerSeconds);
                        localStorage.setItem('math_best_time_sec', timerSeconds.toString());
                      }
                      setPoints((p) => p + 500);
                      setTotalXp((x) => x + 500);
                      setIsVictoryOpen(true);
                    } else {
                      setCurrentProblemIndex((i) => i + 1);
                      generateProblem();
                    }
                  }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-3xl font-black text-lg shadow-xl flex-1 animate-pulse"
                >
                  Siguiente ➡️
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav
        activeTab={currentActiveTab}
        mascotIcon={equippedMascot}
        hasClaimableMission={hasClaimableMission}
        onChangeTab={(tab) => {
          setIsOptionsOpen(tab === 'levels');
          setIsProfileOpen(tab === 'profile');
          setIsTeacherReportOpen(tab === 'report');
          setIsStoreOpen(tab === 'store');
          if (tab === 'worksheets') setIsWorksheetShareOpen(true);
        }}
      />

      {/* WelcomeModal: solo al primer inicio */}
      <WelcomeModal isOpen={isWelcomeOpen} onClose={() => setIsWelcomeOpen(false)} playerName={playerName} onUpdatePlayerName={setPlayerName} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} currentLevel={currentLevel} onSelectLevel={setCurrentLevel} onStartGame={resetGameProgress} />

      {/* Niveles/Opciones: niveles y modos de juego */}
      <OptionsMenuModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentLevel={currentLevel}
        currentMode={currentMode}
        onChangeLevel={(l) => { setCurrentLevel(l); generateProblem(l, currentMode); }}
        onChangeMode={(m) => { setCurrentMode(m); generateProblem(currentLevel, m); }}
        onResetStats={() => { setSolvedCount(0); setStreak(0); setMaxStreak(0); setTimerSeconds(0); }}
        onOpenWelcome={() => { setIsOptionsOpen(false); setIsWelcomeOpen(true); }}
      />

      {/* Perfil: dashboard del jugador */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-3 no-print"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
        >
          <div className="max-w-lg mx-auto pt-2 pb-24">
            <div className="flex justify-end mb-2">
              <button onClick={() => setIsProfileOpen(false)} className="p-2 bg-white rounded-2xl shadow-lg text-slate-500 font-black">✕ Cerrar</button>
            </div>
            <ProfileDashboard
              playerName={playerName}
              playerTitle={playerTitle}
              playerTheme={playerTheme}
              playerMotto={playerMotto}
              equippedMascot={equippedMascot}
              equippedAccessory={equippedAccessory}
              unlockedItems={unlockedItems}
              points={points}
              totalXp={totalXp}
              dailyStreak={dailyStreak}
              missions={missions}
              profiles={profiles}
              activeProfileId={activeProfileId}
              streak={streak}
              maxStreak={maxStreak}
              solvedCount={solvedCount}
              timerSeconds={timerSeconds}
              currentLevel={currentLevel}
              currentMode={currentMode}
              onUpdateProfile={(name, title, theme, motto) => {
                setPlayerName(name); setPlayerTitle(title); setPlayerTheme(theme); setPlayerMotto(motto);
                localStorage.setItem('math_player_title', title);
                localStorage.setItem('math_player_theme', theme);
                localStorage.setItem('math_player_motto', motto);
              }}
              onSwitchProfile={handleSwitchProfile}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
              onClaimMission={handleClaimMission}
              onEquipMascot={setEquippedMascot}
              onEquipAccessory={setEquippedAccessory}
              onOpenStore={() => { setIsProfileOpen(false); setIsStoreOpen(true); }}
              onOpenReport={() => { setIsProfileOpen(false); setIsTeacherReportOpen(true); }}
              onStartGame={() => { setIsProfileOpen(false); resetGameProgress(); }}
              onChangeLevelTab={() => { setIsProfileOpen(false); setIsOptionsOpen(true); }}
            />
          </div>
        </div>
      )}

      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        points={points}
        equippedMascot={equippedMascot}
        equippedAccessory={equippedAccessory}
        equippedTheme={equippedTheme}
        unlockedItems={unlockedItems}
        onEquipItem={(i) => {
          if (i.category === 'mascot') setEquippedMascot(i.id);
          else if (i.category === 'accessory') setEquippedAccessory(i.id);
          else if (i.category === 'theme') setEquippedTheme(i.id);
        }}
        onUnlockItem={(i) => {
          setPoints(p => Math.max(0, p - i.cost));
          setUnlockedItems(u => (u.includes(i.id) ? u : [...u, i.id]));
          if (i.category === 'mascot') setEquippedMascot(i.id);
          else if (i.category === 'accessory') setEquippedAccessory(i.id);
          else if (i.category === 'theme') setEquippedTheme(i.id);
        }}
        onAwardPoints={(a) => setPoints(p => p + a)}
        onNotify={showToast}
      />
      <TeacherReportModal
        isOpen={isTeacherReportOpen}
        onClose={() => setIsTeacherReportOpen(false)}
        stats={{ solvedCount, maxStreak: maxStreak, accuracy: solvedCount > 0 ? Math.round((solvedCount / (solvedCount + (3 - lives))) * 100) : 0, points, timeSpentSec: timerSeconds }}
        dailyHistory={dailyHistory}
        onResetStats={() => { setSolvedCount(0); setStreak(0); setMaxStreak(0); setTimerSeconds(0); }}
        onPrintWorksheet={() => setIsWorksheetShareOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />
      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => { setIsVictoryOpen(false); resetGameProgress(); }}
        onGoToStore={() => { setIsVictoryOpen(false); setIsStoreOpen(true); }}
        timerSeconds={timerSeconds}
        bestTimeSeconds={bestTimeSeconds}
        isNewRecord={isNewRecord}
        earnedStars={500}
      />
      <Suspense fallback={null}>
        {isQrScannerOpen && (
          <QrScannerModal
            isOpen={isQrScannerOpen}
            onClose={() => setIsQrScannerOpen(false)}
            onAwardPoints={(a) => { setPoints(p => p + a); setTotalXp(x => x + a); }}
          />
        )}

        {/* Modal para Compartir / Descargar Ficha Secuencial */}
        {isWorksheetShareOpen && (
          <WorksheetShareModal
            isOpen={isWorksheetShareOpen}
            onClose={() => setIsWorksheetShareOpen(false)}
            gradeLevel={currentLevel}
            currentMode={currentMode}
            printCounter={printCounter}
            onIncrementPrintCounter={() => {
              setPrintCounter(c => {
                const next = c + 1;
                localStorage.setItem('math_print_counter', next.toString());
                return next;
              });
            }}
            points={points}
            onSpendPoints={(amt) => setPoints(p => Math.max(0, p - amt))}
            onAwardPoints={(amt) => setPoints(p => p + amt)}
            onNotify={showToast}
          />
        )}
      </Suspense>

      {/* Componente imprimible oculto que solo aparece al llamar a window.print() */}
      <WorksheetPrintable
        gradeLevel={currentLevel}
        currentMode={currentMode}
        printCounter={printCounter}
      />
    </div>
  );
};

export default App;
