import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { StoryCard } from './components/StoryCard';
import { PositionalBoard } from './components/PositionalBoard';
import { DigitsBank } from './components/DigitsBank';
import { BottomNav } from './components/BottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { OptionsMenuModal } from './components/OptionsMenuModal';
import { StoreModal } from './components/StoreModal';
import { TeacherReportModal } from './components/TeacherReportModal';
import { VictoryModal } from './components/VictoryModal';
import { QrScannerModal } from './components/QrScannerModal';
import { WorksheetShareModal } from './components/WorksheetShareModal';
import { SplashScreenOverlay } from './components/SplashScreenOverlay';
import { LEVEL_CONFIGS, STORY_THEMES, ALL_COLUMNS } from './data/constants';
import { OperationMode, GradeLevel, GamePhase, PositionalCol, ProblemData, Chip, StoreItem } from './types';
import { sound } from './utils/sound';

const AUTO_SAVE_KEY = 'math_auto_save_state_v2';

export const App: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<GradeLevel>(3);
  const [currentMode, setCurrentMode] = useState<OperationMode>('add');
  const [points, setPoints] = useState<number>(() => parseInt(localStorage.getItem('math_points') || '0', 10));
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
  const totalProblems = 10;
  const [solvedCount, setSolvedCount] = useState(0);

  const [equippedMascot, setEquippedMascot] = useState<string>(() => localStorage.getItem('math_mascot') || '🐶');
  const [equippedAccessory, setEquippedAccessory] = useState<string>(() => localStorage.getItem('math_accessory') || '🎓');
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('math_unlocked') || '["🐶", "🎓"]'); }
    catch { return ['🐶', '🎓']; }
  });

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('math_player_name') || 'Explorador');

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
  const [printCounter, setPrintCounter] = useState<number>(() => parseInt(localStorage.getItem('math_print_counter') || '1', 10));
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('placing');
  const [placedDigits, setPlacedDigits] = useState<Record<string, string>>({});
  const [chips, setChips] = useState<Chip[]>([]);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [incorrectResultCols, setIncorrectResultCols] = useState<PositionalCol[]>([]);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
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
  }, [currentLevel, currentMode, points, lives, streak, maxStreak, currentProblemIndex, solvedCount, timerSeconds, problem, gamePhase, placedDigits, chips, showSplash, playerName, equippedMascot, equippedAccessory]);

  const handleFinishSplash = useCallback(() => {
    setShowSplash(false);
    if (playerName === 'Explorador') setIsWelcomeOpen(true);
    sound.playSuccess();
  }, [playerName]);

  const handleCellClick = (row: string, col: PositionalCol) => {
    const key = `${row}_${col}`;
    const currentValue = placedDigits[key];
    if (selectedChipId) {
      const chip = chips.find(c => c.id === selectedChipId);
      if (!chip) return;
      if (row === 'carry' && currentValue && currentValue.length === 1) {
        setPlacedDigits(prev => ({ ...prev, [key]: currentValue + chip.value }));
      } else {
        if (currentValue) setChips(prev => prev.map(c => c.value === currentValue.slice(-1) && c.used ? { ...c, used: false } : c));
        setPlacedDigits(prev => ({ ...prev, [key]: chip.value }));
      }
      setChips(prev => prev.map(c => c.id === selectedChipId ? { ...c, used: true } : c));
      setSelectedChipId(null);
      sound.playPop();
    } else if (currentValue) {
      setPlacedDigits(prev => { const n = { ...prev }; delete n[key]; return n; });
      setChips(prev => {
        let restored = false;
        return prev.map(c => {
          if (!restored && c.used && c.value === currentValue.slice(-1)) { restored = true; return { ...c, used: false }; }
          return c;
        });
      });
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
      setPoints(p => p + winPoints);
      setStreak(s => s + 1);
      setSolvedCount(s => s + 1);
      showToast(`¡Excelente! +${winPoints} ⭐`, 'success');
    } else {
      sound.playError();
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

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 pb-24 flex flex-col items-center w-full overflow-x-hidden">
      {showSplash && <SplashScreenOverlay onFinish={handleFinishSplash} />}

      <Header
        points={points} lives={lives} streak={streak} mascot={equippedMascot} accessory={equippedAccessory} playerName={playerName}
        onOpenSettings={() => setIsOptionsOpen(true)} onOpenStore={() => setIsStoreOpen(true)} onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />

      <main className="w-full max-w-lg px-3 mt-4 flex-1 flex flex-col">
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-white font-black text-center transition-all animate-bounce ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
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
                <button onClick={() => { if (currentProblemIndex >= totalProblems) { stopTimer(); setIsVictoryOpen(true); } else { setCurrentProblemIndex(i => i + 1); generateProblem(); } }} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-3xl font-black text-lg shadow-xl flex-1 animate-pulse">Siguiente ➡️</button>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav activeTab="game" onChangeTab={(tab) => { if (tab === 'levels') setIsOptionsOpen(true); if (tab === 'store') setIsStoreOpen(true); if (tab === 'report') setIsTeacherReportOpen(true); if (tab === 'profile') setIsWelcomeOpen(true); }} />

      <WelcomeModal isOpen={isWelcomeOpen} onClose={() => setIsWelcomeOpen(false)} playerName={playerName} onUpdatePlayerName={setPlayerName} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} currentLevel={currentLevel} onSelectLevel={(l) => { setCurrentLevel(l); generateProblem(l); }} onStartGame={resetGameProgress} />
      <OptionsMenuModal isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} currentLevel={currentLevel} currentMode={currentMode} onChangeLevel={(l) => { setCurrentLevel(l); generateProblem(l, currentMode); }} onChangeMode={(m) => { setCurrentMode(m); generateProblem(currentLevel, m); }} />
      <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} points={points} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} unlockedItems={unlockedItems} onEquipItem={(i) => i.category === 'mascot' ? setEquippedMascot(i.id) : setEquippedAccessory(i.id)} onUnlockItem={(i) => { setPoints(p => p - i.cost); setUnlockedItems(u => [...u, i.id]); }} />
      <TeacherReportModal isOpen={isTeacherReportOpen} onClose={() => setIsTeacherReportOpen(false)} solvedCount={solvedCount} lives={lives} streak={streak} points={points} currentLevel={currentLevel} currentMode={currentMode} onPrintWorksheet={() => setIsWorksheetShareOpen(true)} />
      <VictoryModal isOpen={isVictoryOpen} onClose={() => { setIsVictoryOpen(false); resetGameProgress(); }} onGoToStore={() => { setIsVictoryOpen(false); setIsStoreOpen(true); }} timeSeconds={timerSeconds} pointsEarned={500} />
      <QrScannerModal isOpen={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)} onAwardPoints={(a) => setPoints(p => p + a)} />
    </div>
  );
};

export default App;
