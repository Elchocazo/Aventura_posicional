import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Calculator,
  CheckCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Header } from './components/Header';
import { StoryCard } from './components/StoryCard';
import { PositionalBoard } from './components/PositionalBoard';
import { DigitsBank } from './components/DigitsBank';
import { BottomNav, TabType } from './components/BottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { OptionsMenuModal } from './components/OptionsMenuModal';
import { StoreView } from './components/StoreModal';
import { TeacherReportView } from './components/TeacherReportModal';
import { VictoryModal } from './components/VictoryModal';
import { QrScannerModal } from './components/QrScannerModal';
import { WorksheetShareModal } from './components/WorksheetShareModal';
import { ProfileDashboard } from './components/ProfileDashboard';
import { LEVEL_CONFIGS, STORY_THEMES, ALL_COLUMNS } from './data/constants';
import { OperationMode, GradeLevel, GamePhase, PositionalCol, ProblemData, Chip, StoreItem } from './types';
import { sound } from './utils/sound';

// Capacitor Plugins
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const AUTO_SAVE_KEY = 'math_adventure_v15_final';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('game');
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

  const [equippedMascot, setEquippedMascot] = useState<string>(() => localStorage.getItem('math_mascot') || '🐶');
  const [equippedAccessory, setEquippedAccessory] = useState<string>(() => localStorage.getItem('math_accessory') || '🎓');
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('math_unlocked') || '["🐶", "🎓"]'); }
    catch { return ['🐶', '🎓']; }
  });

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('math_player_name') || 'Explorador');
  const [playerTitle, setPlayerTitle] = useState(() => localStorage.getItem('math_player_title') || 'Aventurero del Cálculo');

  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
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

  const showToast = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
  };

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const resetTimer = () => { stopTimer(); setTimerSeconds(0); startTimer(); };

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
    setProblem({ num1, num2, operation: operationSym, activeCols, story: { icon: theme.icon, text: operationSym === '+' ? theme.addStory(num1.toLocaleString(), num2.toLocaleString()) : theme.subStory(num1.toLocaleString(), num2.toLocaleString()), question: operationSym === '+' ? theme.addQuestion : theme.subQuestion } });
    setGamePhase('placing'); setPlacedDigits({}); setIncorrectResultCols([]); setSelectedChipId(null);
    const d1 = num1.toString().split(''), d2 = num2.toString().split('');
    const all = [...d1, ...d2].sort(() => Math.random() - 0.5);
    setChips(all.map((val, idx) => ({ id: `chip_place_${idx}_${val}`, value: val, used: false })));
  };

  const resetGameProgress = () => { setCurrentProblemIndex(1); setLives(3); setStreak(0); resetTimer(); generateProblem(); };

  useEffect(() => {
    generateProblem();
    startTimer();
    return () => stopTimer();
  }, [currentLevel, currentMode]);

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

    let requiredChips: { val: string; carry: boolean }[] = [];
    resDigits.forEach(d => requiredChips.push({ val: d, carry: false }));

    if (problem.operation === '-') {
      // Garantizamos TODOS los números necesarios para préstamos (0-18)
      ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'].forEach(v => requiredChips.push({ val: v, carry: true }));
    } else {
      requiredChips.push({ val: '1', carry: true }, { val: '1', carry: true });
    }

    ['0','1','2','3','4','5','6','7','8','9'].sort(() => Math.random() - 0.5).slice(0, 3).forEach(v => requiredChips.push({ val: v, carry: false }));

    const seen = new Set<string>();
    const pool = requiredChips.filter(item => {
      const key = `${item.val}_${item.carry}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => (a.carry === b.carry ? 0 : a.carry ? -1 : 1));

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
      if (lives <= 1) { showToast('¡Vuelve a intentar! 💪', 'error'); resetGameProgress(); }
      else showToast('¡Revisa el cálculo! ❤️', 'error');
    }
  };

  const handlePrintWorksheet = async () => {
    const fichaNum = (printCounter % 50) + 1;
    setPrintCounter(printCounter + 1);
    localStorage.setItem('math_print_counter', (printCounter + 1).toString());
    const fileName = `ficha${currentLevel}-${String(fichaNum).padStart(3, '0')}.pdf`;
    const fileUrl = window.location.origin + `/fichas/grado${currentLevel}/${fileName}`;
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const savedFile = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
        await Share.share({ title: fileName, files: [savedFile.uri] });
      };
    } catch (err) { window.open(fileUrl, '_system'); }
  };

  return (
    <div className="min-h-screen bg-slate-100/50 text-slate-900 pb-24 flex flex-col items-center">
      <Header mascot={equippedMascot} accessory={equippedAccessory} lives={lives} streak={streak} playerName={playerName}
        onOpenSettings={() => setIsOptionsOpen(true)} onOpenStore={() => setActiveTab('store')} onOpenQrScanner={() => setIsQrScannerOpen(true)} />

      <main className="w-full max-w-lg px-3 sm:px-4 mt-4 space-y-4 flex-1 overflow-y-auto">
        {toastMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl font-black text-xs text-white bg-sky-600 animate-bounce">
            {toastMessage.text}
          </div>
        )}

        {/* TAB: JUEGO */}
        {activeTab === 'game' && problem && (
          <div className="space-y-4 animate-fadeIn">
            <StoryCard problem={problem} currentProblemIndex={currentProblemIndex} gradeLabel={LEVEL_CONFIGS[currentLevel].label} gamePhase={gamePhase} />
            <DigitsBank chips={chips} selectedChipId={selectedChipId} onSelectChip={setSelectedChipId} gamePhase={gamePhase} />
            {/* key={currentProblemIndex} obliga al tablero a reiniciarse cada vez que cambia el problema, eliminando tachados previos */}
            <PositionalBoard key={`${currentProblemIndex}_${currentLevel}_${currentMode}`} num1={problem.num1} num2={problem.num2} operation={problem.operation} activeCols={problem.activeCols} gamePhase={gamePhase} placedDigits={placedDigits} selectedDigit={selectedChipId ? chips.find((c) => c.id === selectedChipId)?.value || null : null} onCellClick={handleCellClick} incorrectResultCols={incorrectResultCols} />
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 pb-1">
              <button onClick={() => { sound.playSelect(); generateProblem(); }} className="clay-btn-white px-4 py-3 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95"><RotateCcw className="w-4 h-4 text-slate-500" /><span>Reiniciar</span></button>
              {gamePhase === 'placing' && <button onClick={handleCalculatePhase} disabled={chips.some(c => !c.used)} className={`px-5 py-3 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 ${!chips.some(c => !c.used) ? 'clay-btn-sky animate-bounce' : 'bg-slate-100 text-slate-400 opacity-60 rounded-2xl'}`}><Calculator className="w-4 h-4" /><span>¡Validar!</span></button>}
              {gamePhase === 'calculating' && <button onClick={handleCheckFinalAnswer} className="clay-btn-emerald px-5 py-3 font-black text-xs flex items-center gap-1.5 shadow-md animate-pulse active:scale-95"><CheckCircle className="w-4 h-4" /><span>Comprobar</span></button>}
              {gamePhase === 'complete' && <button onClick={() => { setCurrentProblemIndex(i => i + 1); generateProblem(); }} className="clay-btn-amber px-6 py-3 font-black text-xs flex items-center gap-1.5 animate-bounce shadow-md active:scale-95"><span>Siguiente</span><ArrowRight className="w-4 h-4" /></button>}
              <button onClick={() => showToast('💡 Resuelve de derecha a izquierda', 'info')} className="clay-btn-purple px-4 py-3 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95"><Lightbulb className="w-4 h-4 text-amber-300" /><span>Ayuda</span></button>
            </div>
          </div>
        )}

        {/* TAB: NIVELES */}
        {activeTab === 'levels' && (
          <div className="clay-card p-5 space-y-6 animate-fadeIn shadow-lg">
            <h2 className="font-black text-sky-900 border-b-2 pb-2 text-center text-lg flex items-center justify-center gap-2">⚙️ Configuración del Reto</h2>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">¿Qué operación quieres?</label>
              <div className="grid grid-cols-3 gap-2">
                {(['add', 'sub', 'mix'] as OperationMode[]).map((m) => (
                  <button key={m} onClick={() => setCurrentMode(m)} className={`py-4 rounded-2xl font-black text-xs transition-all active:scale-95 ${currentMode === m ? 'clay-btn-sky shadow-md' : 'clay-btn-white shadow-sm border border-slate-100'}`}>{m === 'add' ? '➕ Suma' : m === 'sub' ? '➖ Resta' : '🔀 Mixto'}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Elige tu nivel escolar</label>
              <div className="grid grid-cols-1 gap-2.5">
                {([2, 3, 4, 5] as GradeLevel[]).map((lvl) => (
                  <button key={lvl} onClick={() => setCurrentLevel(lvl)} className={`p-4 rounded-2xl transition-all text-left flex items-center justify-between active:scale-98 ${currentLevel === lvl ? 'clay-card-sky border-2 border-sky-400' : 'clay-btn-white shadow-sm border border-slate-100'}`}>
                    <div>
                      <div className="font-black text-base text-slate-800">{lvl}° Grado Primaria</div>
                      <div className="text-[10px] font-bold text-sky-700 opacity-80 uppercase">{LEVEL_CONFIGS[lvl].label}</div>
                    </div>
                    {currentLevel === lvl && <CheckCircle className="w-5 h-5 text-sky-600" />}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setActiveTab('game'); resetGameProgress(); }} className="w-full clay-btn-amber py-4 font-black text-sm mt-2 shadow-lg animate-float">¡GUARDAR Y JUGAR! 🚀</button>
          </div>
        )}

        {/* TAB: PERFIL */}
        {activeTab === 'profile' && (
          <div className="animate-fadeIn">
            <ProfileDashboard
              playerName={playerName} playerTitle={playerTitle} playerTheme="sky" playerMotto="¡Las matemáticas son mi superpoder! 🚀"
              equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} unlockedItems={unlockedItems}
              points={points} streak={streak} maxStreak={maxStreak} solvedCount={solvedCount} timerSeconds={timerSeconds} currentLevel={currentLevel} currentMode={currentMode}
              onUpdateProfile={(name, title) => {
                setPlayerName(name); setPlayerTitle(title);
                localStorage.setItem('math_player_name', name); localStorage.setItem('math_player_title', title);
                showToast('Perfil actualizado ✨', 'success');
              }}
              onEquipMascot={setEquippedMascot} onEquipAccessory={setEquippedAccessory} onOpenStore={() => setActiveTab('store')} onOpenReport={() => setActiveTab('report')} onStartGame={() => setActiveTab('game')} onChangeLevelTab={() => setActiveTab('levels')}
            />
          </div>
        )}

        {/* TAB: TIENDA */}
        {activeTab === 'store' && (
          <div className="animate-fadeIn">
            <StoreView
              points={points} equippedMascot={equippedMascot} equippedAccessory={equippedAccessory} unlockedItems={unlockedItems}
              onEquipItem={(item) => {
                if (item.category === 'mascot') setEquippedMascot(item.id); else setEquippedAccessory(item.id);
                showToast(`¡${item.name} equipado! ✨`, 'success');
              }}
              onUnlockItem={(item) => {
                if (points >= item.cost) {
                  setPoints(p => p - item.cost); setUnlockedItems(prev => [...prev, item.id]);
                  showToast(`¡Desbloqueado! 🎉`, 'success');
                }
              }}
            />
          </div>
        )}

        {/* TAB: REPORTE */}
        {activeTab === 'report' && (
          <div className="animate-fadeIn">
            <TeacherReportView
              stats={{ solvedCount, accuracy: solvedCount > 0 ? 100 : 100, maxStreak, points, timeSpentSec: timerSeconds }}
              onResetStats={() => { setPoints(0); setSolvedCount(0); setStreak(0); setMaxStreak(0); showToast('Estadísticas reiniciadas 🧹', 'info'); }}
              onPrintWorksheet={() => setIsWorksheetShareOpen(true)}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        playerName={playerName}
        onUpdatePlayerName={setPlayerName}
        equippedMascot={equippedMascot}
        equippedAccessory={equippedAccessory}
        currentLevel={currentLevel}
        onSelectLevel={setCurrentLevel}
        onStartGame={resetGameProgress}
      />
      <OptionsMenuModal isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} currentLevel={currentLevel} currentMode={currentMode} onChangeLevel={setCurrentLevel} onChangeMode={setCurrentMode} />
      <VictoryModal isOpen={isVictoryOpen} onClose={() => { setIsVictoryOpen(false); resetGameProgress(); }} onGoToStore={() => { setIsVictoryOpen(false); setActiveTab('store'); }} timeSeconds={timerSeconds} pointsEarned={500} />
      <QrScannerModal isOpen={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)} onAwardPoints={(amount) => { setPoints(p => p + amount); showToast(`Ficha calificada +${amount} ⭐`, 'success'); setIsQrScannerOpen(false); }} />
      {isWorksheetShareOpen && <WorksheetShareModal isOpen={isWorksheetShareOpen} onClose={() => setIsWorksheetShareOpen(false)} gradeLevel={currentLevel} currentMode={currentMode} printCounter={printCounter} onPrint={handlePrintWorksheet} />}
    </div>
  );
};

export default App;
