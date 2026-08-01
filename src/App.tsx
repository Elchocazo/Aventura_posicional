import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Calculator,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import {
  GameMode,
  GradeLevel,
  GamePhase,
  PositionalCol,
  ProblemData,
  StoreItem,
  TeacherReportStats,
} from './types';
import {
  LEVEL_CONFIGS,
  ALL_COLUMNS,
  STORY_THEMES,
  STORE_MASCOTS,
  STORE_ACCESSORIES,
} from './data/constants';
import { sound } from './utils/sound';
import { Header } from './components/Header';
import { StoryCard } from './components/StoryCard';
import { PositionalBoard } from './components/PositionalBoard';
import { DigitsBank } from './components/DigitsBank';
import { BottomNav, TabType } from './components/BottomNav';
import { StoreModal, StoreView } from './components/StoreModal';
import { VictoryModal } from './components/VictoryModal';
import { TeacherReportModal, TeacherReportView } from './components/TeacherReportModal';
import { WorksheetPrintable } from './components/WorksheetPrintable';
import { ProfileDashboard } from './components/ProfileDashboard';
import { OptionsMenuModal } from './components/OptionsMenuModal';
import { QrScannerModal } from './components/QrScannerModal';
import { WorksheetShareModal } from './components/WorksheetShareModal';
import { WelcomeModal } from './components/WelcomeModal';

// Plugins nativos de Capacitor
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const AUTO_SAVE_KEY = 'math_auto_save_game';

interface SavedGameState {
  currentLevel: GradeLevel;
  currentMode: GameMode;
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

interface Chip {
  id: string;
  value: string;
  isDistractor?: boolean;
  isCarry?: boolean;
  used?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('game');
  const [currentLevel, setCurrentLevel] = useState<GradeLevel>(3);
  const [currentMode, setCurrentMode] = useState<GameMode>('add');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [points, setPoints] = useState<number>(() => parseInt(localStorage.getItem('math_points') || '0', 10));
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
  const [solvedCount, setSolvedCount] = useState(0);
  const totalProblems = 10;
  const [equippedMascot, setEquippedMascot] = useState<string>(() => localStorage.getItem('math_mascot') || '🦉');
  const [equippedAccessory, setEquippedAccessory] = useState<string>(() => localStorage.getItem('math_accessory') || '🎓');
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('math_unlocked') || '["🦉", "🎓"]'); } catch { return ['🦉', '🎓']; }
  });
  const [playerName, setPlayerName] = useState<string>(() => localStorage.getItem('math_player_name') || 'Explorador Matemático');
  const [playerTitle, setPlayerTitle] = useState<string>(() => localStorage.getItem('math_player_title') || 'Aventurero del Cálculo');
  const [playerTheme, setPlayerTheme] = useState<string>(() => localStorage.getItem('math_player_theme') || 'sky');
  const [playerMotto, setPlayerMotto] = useState<string>(() => localStorage.getItem('math_player_motto') || '¡Las matemáticas son mi superpoder! 🚀');

  const handleUpdateProfile = (name: string, title: string, theme: string, motto: string) => {
    setPlayerName(name); setPlayerTitle(title); setPlayerTheme(theme); setPlayerMotto(motto);
    localStorage.setItem('math_player_name', name); localStorage.setItem('math_player_title', title);
    localStorage.setItem('math_player_theme', theme); localStorage.setItem('math_player_motto', motto);
    showToast('¡Perfil personalizado con éxito! ✨', 'success');
  };

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
      if (currentValue) setChips((prev) => prev.map((c) => (c.used && c.value === currentValue ? { ...c, used: false } : c)));
      setPlacedDigits((prev) => ({ ...prev, [key]: selectedChip.value }));
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
    const distractors = ['0','1','2','3','4','5','6','7','8','9'].filter((d) => !resDigits.includes(d)).sort(() => Math.random() - 0.5).slice(0, 3);
    const pool = [...resDigits.map(v => ({ val: v, carry: false })), ...distractors.map(v => ({ val: v, carry: false })), { val: '1', carry: true }].sort(() => Math.random() - 0.5);
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

  // FUNCIÓN DE DESCARGA MAESTRA PARA ANDROID: Sincronizada con el sistema
  const handlePrintWorksheet = async () => {
    // Calculamos el número de ficha (ciclo del 1 al 50)
    const fichaNum = (printCounter % 50) + 1;
    setPrintCounter(printCounter + 1);
    localStorage.setItem('math_print_counter', (printCounter + 1).toString());

    // NOTA: Tus archivos reales se llaman "ficha2-001.pdf" (minúsculas)
    const formattedNum = String(fichaNum).padStart(3, '0');
    const fileName = `ficha${currentLevel}-${formattedNum}.pdf`;

    // Ruta del archivo dentro de la app (Capacitor sirve los archivos de public desde la raíz)
    const fileUrl = window.location.origin + `/fichas/grado${currentLevel}/${fileName}`;

    showToast(`📂 Procesando ${fileName}...`, 'info');

    try {
      // 1. Descargamos el archivo a la memoria de la aplicación
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`No encontré el archivo en: public/fichas/grado${currentLevel}/`);

      const blob = await response.blob();

      // 2. Convertimos a Base64 para que Capacitor pueda escribirlo nativamente
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error('Error al procesar el archivo.'));
        reader.readAsDataURL(blob);
      });
      const base64Data = await base64Promise;

      // 3. Escribimos el archivo en el sistema de archivos del celular (Carpeta Temporal)
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // 4. Usamos el menú Compartir nativo de Android.
      // IMPORTANTE: Pasamos el archivo REAL (savedFile.uri) para activar la descarga del sistema.
      await Share.share({
        title: `Descargar Ficha N° ${formattedNum}`,
        files: [savedFile.uri], // Enviamos el archivo físico
      });

      showToast(`✅ ¡Listo! Selecciona 'Guardar' para ver la notificación.`, 'success');
    } catch (err: any) {
      console.error('Error en descarga:', err);
      showToast(`❌ Error: ${err.message}`, 'error');
    }
  };

  const handleAwardPointsFromQr = (amount: number) => {
    setPoints((prev) => prev + amount);
    showToast(`¡Ficha calificada! +${amount} ⭐🎉`, 'success');
  };

  const isPlacingComplete = gamePhase === 'placing' && chips.length > 0 && chips.every(c => c.used);
  const isCalculatingComplete = gamePhase === 'calculating' && problem && problem.activeCols.some((col) => placedDigits[`result_${col}`]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50/70 to-pink-100/60 text-slate-800 font-sans">
      <div className="no-print min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 pb-20">
        <div className="w-full max-w-2xl clay-card p-4 shadow-xl border-4 border-white my-auto">
          {activeTab === 'game' && problem && (
            <>
              <Header mascot={equippedMascot} accessory={equippedAccessory} lives={lives} streak={streak} soundEnabled={soundEnabled} playerName={playerName}
                onOpenSettings={() => setIsOptionsOpen(true)} onOpenStore={() => setActiveTab('store')} onOpenQrScanner={() => setIsQrScannerOpen(true)} />
              <main className="mt-4 space-y-4">
                <StoryCard problem={problem} currentProblemIndex={currentProblemIndex} gradeLabel={LEVEL_CONFIGS[currentLevel].label} gamePhase={gamePhase} />
                <DigitsBank chips={chips} selectedChipId={selectedChipId} onSelectChip={(id) => setSelectedChipId(id === selectedChipId ? null : id)} gamePhase={gamePhase} />
                <PositionalBoard num1={problem.num1} num2={problem.num2} operation={problem.operation} activeCols={problem.activeCols} gamePhase={gamePhase} placedDigits={placedDigits}
                  selectedDigit={selectedChipId ? chips.find((c) => c.id === selectedChipId)?.value || null : null} onCellClick={handleCellClick} incorrectResultCols={incorrectResultCols} />
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button onClick={() => { sound.playSelect(); generateProblem(); }} className="clay-btn-white px-4 py-3 font-black text-xs flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-slate-500" /><span>Reiniciar</span></button>
                  {gamePhase === 'placing' && <button onClick={handleCalculatePhase} disabled={!isPlacingComplete} className={`px-5 py-3 font-black text-xs flex items-center gap-1.5 ${isPlacingComplete ? 'clay-btn-sky' : 'bg-slate-100 text-slate-400 opacity-60 rounded-2xl'}`}><Calculator className="w-4 h-4" /><span>¡Validar!</span></button>}
                  {gamePhase === 'calculating' && <button onClick={handleCheckFinalAnswer} disabled={!isCalculatingComplete} className={`px-5 py-3 font-black text-xs flex items-center gap-1.5 ${isCalculatingComplete ? 'clay-btn-emerald' : 'bg-slate-100 text-slate-400 opacity-60 rounded-2xl'}`}><CheckCircle className="w-4 h-4" /><span>Comprobar</span></button>}
                  {gamePhase === 'complete' && <button onClick={handleNextProblem} className="clay-btn-amber px-6 py-3 font-black text-xs flex items-center gap-1.5 animate-bounce"><span>Siguiente</span><ArrowRight className="w-4 h-4" /></button>}
                  <button onClick={handleProvideHint} className="clay-btn-purple px-4 py-3 font-black text-xs flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-300" /><span>Ayuda</span></button>
                </div>
              </main>
            </>
          )}
          {activeTab === 'levels' && (
            <div className="mt-4 clay-card p-5 space-y-4 text-slate-800 text-center">
              <h2 className="font-black text-sky-900 border-b-2 pb-2">Configuración</h2>
              <div className="grid grid-cols-3 gap-2">
                {(['add', 'sub', 'mix'] as GameMode[]).map((m) => (
                  <button key={m} onClick={() => { sound.playSelect(); setCurrentMode(m); setActiveTab('game'); }} className={`py-3 rounded-2xl font-black text-xs ${currentMode === m ? 'clay-btn-sky' : 'clay-btn-white'}`}>{m === 'add' ? '➕ Suma' : m === 'sub' ? '➖ Resta' : '🔀 Mixto'}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([2, 3, 4, 5] as GradeLevel[]).map((lvl) => (
                  <button key={lvl} onClick={() => { sound.playSelect(); setCurrentLevel(lvl); setActiveTab('game'); }} className={`p-3 rounded-2xl ${currentLevel === lvl ? 'clay-card-sky border-2 border-sky-400' : 'clay-btn-white'}`}><div className="font-black text-sm">{lvl}° Grado</div></button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'profile' && <div className="mt-4"><ProfileDashboard playerName={playerName} playerTitle={playerTitle} playerTheme={playerTheme} playerMotto={playerMotto} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} unlockedItems={unlockedItems} points={points} streak={streak} maxStreak={maxStreak} solvedCount={solvedCount} timerSeconds={timerSeconds} currentLevel={currentLevel} currentMode={currentMode} onUpdateProfile={handleUpdateProfile} onEquipMascot={setEquippedMascot} onEquipAccessory={setEquippedAccessory} onOpenStore={() => setActiveTab('store')} onOpenReport={() => setActiveTab('report')} onStartGame={() => setActiveTab('game')} onChangeLevelTab={() => setActiveTab('levels')} /></div>}
          {activeTab === 'store' && <div className="mt-4"><StoreView points={points} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} unlockedItems={unlockedItems} onEquipItem={handleEquipItem} onUnlockItem={handleUnlockItem} /></div>}
          {activeTab === 'report' && <div className="mt-4"><TeacherReportView stats={{ solvedCount, accuracy: currentProblemIndex > 0 ? Math.round((solvedCount / currentProblemIndex) * 100) : 100, maxStreak, points }} onResetStats={() => { setPoints(0); setSolvedCount(0); setStreak(0); setMaxStreak(0); showToast('Estadísticas de la sesión reiniciadas 🧹', 'info'); }} onPrintWorksheet={handlePrintWorksheet} onOpenQrScanner={() => setIsQrScannerOpen(true)} /></div>}
        </div>
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
        {toastMessage && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl shadow-xl font-black text-xs border-2 animate-bounce ${toastMessage.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : toastMessage.type === 'error' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-sky-600 border-sky-400 text-white'}`}>{toastMessage.text}</div>}
        <QrScannerModal isOpen={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)} onAwardPoints={handleAwardPointsFromQr} />
        <OptionsMenuModal isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} soundEnabled={soundEnabled} onToggleSound={handleToggleSound} currentLevel={currentLevel} currentMode={currentMode} onChangeLevelTab={() => setActiveTab('levels')} onOpenWelcome={() => setIsWelcomeOpen(true)} onResetStats={() => { setPoints(0); setSolvedCount(0); showToast('🧹 Reiniciado', 'info'); }} />
        <WelcomeModal isOpen={isWelcomeOpen} onClose={() => setIsWelcomeOpen(false)} playerName={playerName} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} currentLevel={currentLevel} onSelectLevel={setCurrentLevel} onStartGame={() => setIsWelcomeOpen(false)} hasSavedGame={Boolean(localStorage.getItem(AUTO_SAVE_KEY))} />
        <VictoryModal isOpen={isVictoryOpen} onClose={() => { setIsVictoryOpen(false); resetGameProgress(); }} onGoToStore={() => { setIsVictoryOpen(false); setActiveTab('store'); }} timerSeconds={timerSeconds} bestTimeSeconds={bestTime} isNewRecord={isNewRecord} earnedStars={500} />
        <TeacherReportModal isOpen={isTeacherReportOpen} onClose={() => setIsTeacherReportOpen(false)} stats={{ solvedCount, maxStreak, accuracy: solvedCount > 0 ? 100 : 100, points, timeSpentSec: timerSeconds }} onResetStats={() => { setPoints(0); setSolvedCount(0); showToast('🧹 Reiniciado', 'info'); }} onPrintWorksheet={() => { setIsTeacherReportOpen(false); setIsWorksheetShareOpen(true); }} onOpenQrScanner={() => { setIsTeacherReportOpen(false); setIsQrScannerOpen(true); }} />
        <WorksheetShareModal isOpen={isWorksheetShareOpen} onClose={() => setIsWorksheetShareOpen(false)} gradeLevel={currentLevel} currentMode={currentMode} printCounter={printCounter} onPrint={handlePrintWorksheet} />
      </div>
    </div>
  );
}
