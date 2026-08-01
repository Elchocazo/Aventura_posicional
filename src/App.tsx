import React, { useState, useEffect, useRef } from 'react';
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
import { LEVEL_CONFIGS, STORY_THEMES, ALL_COLUMNS } from './data/constants';
import { OperationMode, GradeLevel, GamePhase, PositionalCol, ProblemData, Chip, StoreItem } from './types';
import { sound } from './utils/sound';

const AUTO_SAVE_KEY = 'math_auto_save_state_v2';

interface SavedGameState {
  currentLevel: GradeLevel;
  currentMode: OperationMode;
  points: number;
  lives: number;
  streak: number;
  maxStreak: number;
  currentProblemIndex: number;
  solvedCount: number;
  timerSeconds: number;
  problem: ProblemData;
  gamePhase: GamePhase;
  placedDigits: Record<string, string>;
  chips: Chip[];
}

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
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [equippedMascot, setEquippedMascot] = useState<string>(() => localStorage.getItem('math_mascot') || '🦉');
  const [equippedAccessory, setEquippedAccessory] = useState<string>(() => localStorage.getItem('math_accessory') || '🎓');
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('math_unlocked') || '["🦉", "🎓"]'); }
    catch { return ['🦉', '🎓']; }
  });

  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isTeacherReportOpen, setIsTeacherReportOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isWorksheetShareOpen, setIsWorksheetShareOpen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [printCounter, setPrintCounter] = useState<number>(() => parseInt(localStorage.getItem('math_print_counter') || '1', 10));
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('placing');
  const [placedDigits, setPlacedDigits] = useState<Record<string, string>>({});
  const [chips, setChips] = useState<Chip[]>([]);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [incorrectResultCols, setIncorrectResultCols] = useState<PositionalCol[]>([]);

  const showToast = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
  };

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const resetTimer = () => { stopTimer(); setTimerSeconds(0); startTimer(); };

  useEffect(() => {
    localStorage.setItem('math_points', points.toString());
    localStorage.setItem('math_mascot', equippedMascot);
    localStorage.setItem('math_accessory', equippedAccessory);
    localStorage.setItem('math_unlocked', JSON.stringify(unlockedItems));
  }, [points, equippedMascot, equippedAccessory, unlockedItems]);

  const generateProblem = () => {
    const config = LEVEL_CONFIGS[currentLevel];
    let op = currentMode;
    if (op === 'mix') op = Math.random() > 0.5 ? 'add' : 'sub';
    const raw1 = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
    const raw2 = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;
    let num1 = raw1, num2 = raw2, operationSym: '+' | '-' = '+';
    if (op === 'sub') { operationSym = '-'; num1 = Math.max(raw1, raw2); num2 = Math.min(raw1, raw2); }
    else { operationSym = '+'; num1 = raw1; num2 = raw2; }
    const result = operationSym === '+' ? num1 + num2 : num1 - num2;
    const maxDigits = Math.max(num1.toString().length, num2.toString().length, result.toString().length);
    const activeCols = ALL_COLUMNS.slice(ALL_COLUMNS.length - maxDigits);
    const theme = STORY_THEMES[Math.floor(Math.random() * STORY_THEMES.length)];
    const storyText = operationSym === '+' ? theme.addStory(num1.toLocaleString(), num2.toLocaleString()) : theme.subStory(num1.toLocaleString(), num2.toLocaleString());
    const questionText = operationSym === '+' ? theme.addQuestion : theme.subQuestion;
    setProblem({ num1, num2, operation: operationSym, activeCols, story: { icon: theme.icon, text: storyText, question: questionText } });
    setGamePhase('placing'); setPlacedDigits({}); setIncorrectResultCols([]); setSelectedChipId(null);
    const d1 = num1.toString().split(''), d2 = num2.toString().split('');
    const all = [...d1, ...d2].sort(() => Math.random() - 0.5);
    setChips(all.map((val, idx) => ({ id: `chip_place_${idx}_${val}`, value: val, used: false })));
  };

  const resetGameProgress = () => { setCurrentProblemIndex(1); setLives(3); setStreak(0); resetTimer(); generateProblem(); };
  const isInitialMountRef = useRef(true);
  const prevConfigRef = useRef({ level: currentLevel, mode: currentMode });

  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(AUTO_SAVE_KEY);
      if (savedStr) {
        const saved: SavedGameState = JSON.parse(savedStr);
        if (saved && saved.problem) {
          setCurrentLevel(saved.currentLevel); setCurrentMode(saved.currentMode); setPoints(saved.points);
          setLives(saved.lives); setStreak(saved.streak); setMaxStreak(saved.maxStreak);
          setCurrentProblemIndex(saved.currentProblemIndex); setSolvedCount(saved.solvedCount); setTimerSeconds(saved.timerSeconds);
          setProblem(saved.problem); setGamePhase(saved.gamePhase); setPlacedDigits(saved.placedDigits); setChips(saved.chips);
          startTimer(); showToast('¡Partida reanudada! 🎮', 'info'); return;
        }
      }
    } catch (e) {}
    resetGameProgress();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (isInitialMountRef.current) { isInitialMountRef.current = false; return; }
    if (prevConfigRef.current.level !== currentLevel || prevConfigRef.current.mode !== currentMode) {
      prevConfigRef.current = { level: currentLevel, mode: currentMode }; resetGameProgress();
    }
  }, [currentLevel, currentMode]);

  useEffect(() => {
    if (!problem) return;
    const stateToSave = { currentLevel, currentMode, points, lives, streak, maxStreak, currentProblemIndex, solvedCount, timerSeconds, problem, gamePhase, placedDigits, chips };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(stateToSave));
  }, [currentLevel, currentMode, points, lives, streak, maxStreak, currentProblemIndex, solvedCount, timerSeconds, problem, gamePhase, placedDigits, chips]);

  const handleCellClick = (row: string, col: PositionalCol) => {
    const key = `${row}_${col}`, currentValue = placedDigits[key];
    if (selectedChipId) {
      const selectedChip = chips.find((c) => c.id === selectedChipId);
      if (!selectedChip) return;

      if (row === 'carry' && currentValue && currentValue.length === 1 && selectedChip.value.length === 1) {
        const combinedVal = currentValue + selectedChip.value;
        setPlacedDigits((prev) => ({ ...prev, [key]: combinedVal }));
      } else {
        if (currentValue) setChips((prev) => prev.map((c) => (c.used && c.value === currentValue ? { ...c, used: false } : c)));
        setPlacedDigits((prev) => ({ ...prev, [key]: selectedChip.value }));
      }

      setChips((prev) => prev.map((c) => (c.id === selectedChipId ? { ...c, used: true } : c)));
      setSelectedChipId(null); sound.playPop();
    } else if (currentValue) {
      setPlacedDigits((prev) => { const next = { ...prev }; delete next[key]; return next; });
      setChips((prev) => { let restored = false; return prev.map((c) => { if (!restored && c.used && c.value === currentValue) { restored = true; return { ...c, used: false }; } return c; }); });
      sound.playSelect();
    }
  };

  const handleCalculatePhase = () => {
    if (!problem) return;
    let r1 = '', r2 = '';
    problem.activeCols.forEach((col) => { r1 += placedDigits[`num1_${col}`] || ''; r2 += placedDigits[`num2_${col}`] || ''; });
    const v1 = parseInt(r1, 10) || 0, v2 = parseInt(r2, 10) || 0;
    const isValid = (v1 === problem.num1 && v2 === problem.num2) || (problem.operation === '+' && v1 === problem.num2 && v2 === problem.num1);
    if (!isValid) { sound.playError(); showToast('¡Revisa los números! La "U" va a la derecha. 🔍', 'error'); return; }
    sound.playSuccess(); setGamePhase('calculating'); setSelectedChipId(null);
    const result = problem.operation === '+' ? problem.num1 + problem.num2 : problem.num1 - problem.num2;
    const resDigits = result.toString().split('');
    const distractors = ['0','1','2','3','4','5','6','7','8','9'].filter((d) => !resDigits.includes(d)).sort(() => Math.random() - 0.5).slice(0, 2);

    let minuendLoanChips: string[] = [];
    if (problem.operation === '-') {
      const str1 = problem.num1.toString();
      const str2 = problem.num2.toString();
      const maxLen = Math.max(str1.length, str2.length);
      const p1 = str1.padStart(maxLen, '0').split('').map(Number);
      const p2 = str2.padStart(maxLen, '0').split('').map(Number);

      let borrowedFromMe = false;
      for (let i = maxLen - 1; i >= 0; i--) {
        let topDigit = p1[i] - (borrowedFromMe ? 1 : 0);
        let bottomDigit = p2[i];

        if (topDigit < bottomDigit && i > 0) {
          minuendLoanChips.push((topDigit + 10).toString());
          borrowedFromMe = true;
        } else {
          borrowedFromMe = false;
        }

        if (p1[i] !== topDigit && topDigit >= 0) {
          minuendLoanChips.push(topDigit.toString());
        }
      }

      minuendLoanChips.push('10', '11', '12', '13', '14', '15', '16', '17', '18', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    }

    const rawPool = problem.operation === '-'
      ? [...resDigits.map(v => ({ val: v, carry: false })), ...distractors.map(v => ({ val: v, carry: false })), ...minuendLoanChips.map(v => ({ val: v, carry: true }))]
      : [...resDigits.map(v => ({ val: v, carry: false })), ...distractors.map(v => ({ val: v, carry: false })), { val: '1', carry: true }, { val: '1', carry: true }];

    const uniqueVals = new Set<string>();
    const pool = rawPool.filter(item => {
      const key = `${item.val}_${item.carry}`;
      if (uniqueVals.has(key)) return false;
      uniqueVals.add(key);
      return true;
    }).sort(() => Math.random() - 0.5);

    setChips(pool.map((item, idx) => ({ id: `chip_calc_${idx}_${item.val}`, value: item.val, isCarry: item.carry, used: false })));
  };

  const handleCheckFinalAnswer = () => {
    if (!problem) return;
    let res = ''; problem.activeCols.forEach((col) => res += placedDigits[`result_${col}`] || '0');
    const userRes = parseInt(res, 10) || 0, expected = problem.operation === '+' ? problem.num1 + problem.num2 : problem.num1 - problem.num2;
    if (userRes === expected) {
      setGamePhase('complete'); sound.playSuccess();
      const bonus = 100 + streak * 20; setPoints((prev) => prev + bonus); setStreak((prev) => prev + 1); setSolvedCount((prev) => prev + 1);
      showToast(`¡EXTRAORDINARIO! +${bonus} ⭐`, 'success');
    } else {
      sound.playError(); setIncorrectResultCols(problem.activeCols); setTimeout(() => setIncorrectResultCols([]), 1500);
      setLives((prev) => prev - 1); setStreak(0);
      if (lives <= 1) { showToast('¡Vuelve a intentar! 💪', 'error'); setTimeout(() => resetGameProgress(), 2500); }
      else showToast('¡Revisa el cálculo! ❤️', 'error');
    }
  };

  const handleNextProblem = () => {
    if (currentProblemIndex >= totalProblems) {
      stopTimer(); setIsVictoryOpen(true); setPoints((prev) => prev + 500);
    } else { setCurrentProblemIndex((prev) => prev + 1); generateProblem(); }
  };

  const handleProvideHint = () => {
    sound.playPop(); if (!problem) return;
    const msg = gamePhase === 'placing' ? `Acomoda ${problem.num1} y ${problem.num2}` : `Resultado: ${problem.operation === '+' ? problem.num1 + problem.num2 : problem.num1 - problem.num2}`;
    showToast(`💡 Pista: ${msg}`, 'info');
  };

  const handleEquipItem = (item: StoreItem) => {
    if (item.category === 'mascot') setEquippedMascot(item.id); else setEquippedAccessory(item.id);
    showToast(`¡Equipado! ✨`, 'success');
  };

  const handleUnlockItem = (item: StoreItem) => {
    setPoints((prev) => prev - item.cost); setUnlockedItems((prev) => [...prev, item.id]);
    if (item.category === 'mascot') setEquippedMascot(item.id); else setEquippedAccessory(item.id);
    showToast(`¡Desbloqueado! 🎉`, 'success');
  };

  const handlePrintWorksheet = async () => {
    const fichaNum = (printCounter % 50) + 1;
    setPrintCounter(printCounter + 1);
    localStorage.setItem('math_print_counter', (printCounter + 1).toString());
    const fileName = `ficha${currentLevel}-${String(fichaNum).padStart(3, '0')}.pdf`;
    setIsWorksheetShareOpen(true);
    showToast(`¡Ficha ${fileName} generada con éxito! 📄`, 'success');
  };

  const handleQrScanned = (scannedData: any) => {
    setIsQrScannerOpen(false); sound.playSuccess();
    setPoints((prev) => prev + 300); showToast(`¡Ficha ${scannedData.sheetId || ''} calificada! +300 ⭐`, 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-indigo-50 text-slate-900 pb-20 flex flex-col items-center">
      <Header points={points} lives={lives} streak={streak} timerSeconds={timerSeconds} currentProblem={currentProblemIndex} totalProblems={totalProblems} mascot={equippedMascot} accessory={equippedAccessory} onOpenOptions={() => setIsOptionsOpen(true)} onOpenStore={() => setIsStoreOpen(true)} onOpenTeacherReport={() => setIsTeacherReportOpen(true)} onOpenQrScanner={() => setIsQrScannerOpen(true)} soundEnabled={soundEnabled} onToggleSound={handleToggleSound} />
      <main className="w-full max-w-lg px-3 sm:px-4 mt-2 font-comic space-y-3 flex-1">
        {toastMessage && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl font-black text-sm text-white transition-all animate-bounce ${toastMessage.type === 'error' ? 'bg-rose-500' : toastMessage.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'}`}>
            {toastMessage.text}
          </div>
        )}
        {problem && <StoryCard icon={problem.story.icon} storyText={problem.story.text} questionText={problem.story.question} currentLevel={currentLevel} currentProblemIndex={currentProblemIndex} totalProblems={totalProblems} />}
        {problem && <DigitsBank chips={chips} selectedChipId={selectedChipId} onSelectChip={setSelectedChipId} gamePhase={gamePhase} />}
        {problem && <PositionalBoard num1={problem.num1} num2={problem.num2} operation={problem.operation} activeCols={problem.activeCols} gamePhase={gamePhase} placedDigits={placedDigits} selectedDigit={selectedChipId ? chips.find((c) => c.id === selectedChipId)?.value || null : null} onCellClick={handleCellClick} incorrectResultCols={incorrectResultCols} />}
        <div className="flex items-center justify-between gap-2 py-1">
          <button onClick={resetGameProgress} className="clay-btn bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs sm:text-sm font-black py-2.5 px-3 rounded-2xl">🔄 Reiniciar</button>
          {gamePhase === 'placing' && <button onClick={handleCalculatePhase} className="clay-btn bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm font-black py-2.5 px-4 rounded-2xl shadow-md">🧮 ¡Calcular!</button>}
          {gamePhase === 'calculating' && <button onClick={handleCheckFinalAnswer} className="clay-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black py-2.5 px-4 rounded-2xl shadow-md">✅ Comprobar</button>}
          {gamePhase === 'complete' && <button onClick={handleNextProblem} className="clay-btn bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs sm:text-sm font-black py-2.5 px-4 rounded-2xl shadow-md animate-pulse">➡️ Siguiente</button>}
          <button onClick={handleProvideHint} className="clay-btn bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs sm:text-sm font-black py-2.5 px-3 rounded-2xl">💡 Ayuda</button>
        </div>
      </main>

      <BottomNav activeTab="game" onTabChange={(tab) => { if (tab === 'options') setIsOptionsOpen(true); if (tab === 'store') setIsStoreOpen(true); if (tab === 'report') setIsTeacherReportOpen(true); }} />

      <WelcomeModal isOpen={isWelcomeOpen} onClose={() => setIsWelcomeOpen(false)} onSelectLevel={(lvl) => { setCurrentLevel(lvl); setIsWelcomeOpen(false); }} />
      <OptionsMenuModal isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} currentLevel={currentLevel} currentMode={currentMode} onChangeLevel={(lvl) => { setCurrentLevel(lvl); setIsOptionsOpen(false); }} onChangeMode={(mode) => { setCurrentMode(mode); setIsOptionsOpen(false); }} />
      <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} points={points} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} unlockedItems={unlockedItems} onEquipItem={handleEquipItem} onUnlockItem={handleUnlockItem} />
      <TeacherReportModal isOpen={isTeacherReportOpen} onClose={() => setIsTeacherReportOpen(false)} solvedCount={solvedCount} lives={lives} streak={streak} points={points} currentLevel={currentLevel} currentMode={currentMode} onPrintWorksheet={handlePrintWorksheet} />
      <VictoryModal isOpen={isVictoryOpen} onClose={() => setIsVictoryOpen(false)} timeSeconds={timerSeconds} bestTime={bestTime} isNewRecord={isNewRecord} pointsEarned={500} onPlayAgain={resetGameProgress} />
      <QrScannerModal isOpen={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)} onScanned={handleQrScanned} />
      {problem && <WorksheetShareModal isOpen={isWorksheetShareOpen} onClose={() => setIsWorksheetShareOpen(false)} currentLevel={currentLevel} currentMode={currentMode} printCounter={printCounter} />}
    </div>
  );
};

export default App;
