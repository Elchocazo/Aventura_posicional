import { DailyMission, DailyStatsEntry, PlayerProfile } from '../types';

const PROFILES_KEY = 'math_profiles_v1';
const ACTIVE_PROFILE_KEY = 'math_active_profile_id_v1';

export function getTodayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getTodayKey(d);
}

export function getLast7DayKeys(): { key: string; label: string }[] {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const result: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      key: getTodayKey(d),
      label: i === 0 ? 'Hoy' : dayNames[d.getDay()],
    });
  }
  return result;
}

export function createDailyMissions(): DailyMission[] {
  return [
    {
      id: 'solve_3',
      title: 'Resuelve 3 ejercicios hoy',
      target: 3,
      progress: 0,
      reward: 50,
      claimed: false,
      type: 'solve',
    },
    {
      id: 'streak_3',
      title: 'Logra una racha de 3 aciertos',
      target: 3,
      progress: 0,
      reward: 80,
      claimed: false,
      type: 'streak',
    },
    {
      id: 'solve_8',
      title: 'Completa 8 ejercicios hoy',
      target: 8,
      progress: 0,
      reward: 120,
      claimed: false,
      type: 'solve',
    },
  ];
}

export function createNewProfile(name: string = 'Explorador', id?: string): PlayerProfile {
  const today = getTodayKey();
  return {
    id: id || `profile_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    title: 'Aventurero del Cálculo',
    theme: 'sky',
    motto: '¡Puedo con todo!',
    points: 0,
    totalXp: 0,
    equippedMascot: '🐶',
    equippedAccessory: '🎓',
    equippedTheme: 'theme_sky',
    unlockedItems: ['🐶', '🦉', '🎓', 'theme_sky'],
    solvedCount: 0,
    maxStreak: 0,
    dailyStreak: 1,
    lastActiveDate: today,
    dailyHistory: [{ date: today, solved: 0, errors: 0, xp: 0 }],
    missionsDate: today,
    missions: createDailyMissions(),
  };
}

export function refreshProfileForToday(profile: PlayerProfile): {
  profile: PlayerProfile;
  streakBonusAwarded: number;
} {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  let updated = { ...profile };
  let streakBonusAwarded = 0;

  // Ensure default unlocked items exist
  if (!updated.unlockedItems.includes('theme_sky')) {
    updated.unlockedItems = [...updated.unlockedItems, 'theme_sky'];
  }
  if (!updated.equippedTheme) {
    updated.equippedTheme = 'theme_sky';
  }
  if (typeof updated.totalXp !== 'number' || Number.isNaN(updated.totalXp)) {
    updated.totalXp = updated.points || 0;
  }

  // Daily streak check
  if (updated.lastActiveDate !== today) {
    if (updated.lastActiveDate === yesterday) {
      updated.dailyStreak = (updated.dailyStreak || 0) + 1;
    } else {
      updated.dailyStreak = 1;
    }
    updated.lastActiveDate = today;
    // Daily login bonus: 25 stars + 10 per streak day (max 100)
    streakBonusAwarded = Math.min(100, 20 + updated.dailyStreak * 10);
    updated.points += streakBonusAwarded;
  }

  // Daily missions reset
  if (updated.missionsDate !== today || !Array.isArray(updated.missions) || updated.missions.length === 0) {
    updated.missionsDate = today;
    updated.missions = createDailyMissions();
  }

  // Ensure today's entry exists in dailyHistory (keep last 14 days)
  const history = Array.isArray(updated.dailyHistory) ? [...updated.dailyHistory] : [];
  if (!history.some((h) => h.date === today)) {
    history.push({ date: today, solved: 0, errors: 0, xp: 0 });
  }
  updated.dailyHistory = history.slice(-14);

  return { profile: updated, streakBonusAwarded };
}

export function loadProfiles(): {
  profiles: PlayerProfile[];
  activeProfileId: string;
  streakBonusAwarded: number;
} {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed: PlayerProfile[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const storedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
        const activeId = parsed.some((p) => p.id === storedActiveId) ? storedActiveId! : parsed[0].id;
        let streakBonusAwarded = 0;
        const refreshed = parsed.map((p) => {
          if (p.id === activeId) {
            const res = refreshProfileForToday(p);
            streakBonusAwarded = res.streakBonusAwarded;
            return res.profile;
          }
          return p;
        });
        saveProfiles(refreshed, activeId);
        return { profiles: refreshed, activeProfileId: activeId, streakBonusAwarded };
      }
    }
  } catch (e) {
    console.error('Error loading profiles:', e);
  }

  // Seamless migration from legacy single-player localStorage keys
  const today = getTodayKey();
  const legacyPoints = parseInt(localStorage.getItem('math_points') || '0', 10) || 0;
  let legacyUnlocked: string[] = ['🐶', '🦉', '🎓', 'theme_sky'];
  try {
    const rawUnlocked = JSON.parse(localStorage.getItem('math_unlocked') || '["🐶", "🦉", "🎓"]');
    if (Array.isArray(rawUnlocked)) {
      legacyUnlocked = Array.from(new Set([...rawUnlocked, '🐶', '🦉', '🎓', 'theme_sky']));
    }
  } catch {
    // keep default
  }

  const migrated: PlayerProfile = {
    id: 'profile_default',
    name: localStorage.getItem('math_player_name') || 'Explorador',
    title: localStorage.getItem('math_player_title') || 'Aventurero del Cálculo',
    theme: localStorage.getItem('math_player_theme') || 'sky',
    motto: localStorage.getItem('math_player_motto') || '¡Puedo con todo!',
    points: legacyPoints,
    totalXp: legacyPoints,
    equippedMascot: localStorage.getItem('math_mascot') || '🐶',
    equippedAccessory: localStorage.getItem('math_accessory') || '🎓',
    equippedTheme: 'theme_sky',
    unlockedItems: legacyUnlocked,
    solvedCount: 0,
    maxStreak: 0,
    dailyStreak: 1,
    lastActiveDate: today,
    dailyHistory: [{ date: today, solved: 0, errors: 0, xp: 0 }],
    missionsDate: today,
    missions: createDailyMissions(),
  };

  saveProfiles([migrated], migrated.id);
  return { profiles: [migrated], activeProfileId: migrated.id, streakBonusAwarded: 0 };
}

export function saveProfiles(profiles: PlayerProfile[], activeProfileId: string): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
  } catch (e) {
    console.error('Error saving profiles:', e);
  }
}

export function recordSolveInHistory(
  history: DailyStatsEntry[],
  xpEarned: number
): DailyStatsEntry[] {
  const today = getTodayKey();
  const next = Array.isArray(history) ? [...history] : [];
  const idx = next.findIndex((h) => h.date === today);
  if (idx >= 0) {
    next[idx] = {
      ...next[idx],
      solved: next[idx].solved + 1,
      xp: next[idx].xp + xpEarned,
    };
  } else {
    next.push({ date: today, solved: 1, errors: 0, xp: xpEarned });
  }
  return next.slice(-14);
}

export function recordErrorInHistory(history: DailyStatsEntry[]): DailyStatsEntry[] {
  const today = getTodayKey();
  const next = Array.isArray(history) ? [...history] : [];
  const idx = next.findIndex((h) => h.date === today);
  if (idx >= 0) {
    next[idx] = {
      ...next[idx],
      errors: next[idx].errors + 1,
    };
  } else {
    next.push({ date: today, solved: 0, errors: 1, xp: 0 });
  }
  return next.slice(-14);
}

export function updateMissionsOnSolve(
  missions: DailyMission[],
  currentStreak: number
): { missions: DailyMission[]; newlyCompletedTitles: string[] } {
  const newlyCompletedTitles: string[] = [];
  const updated = missions.map((m) => {
    const wasComplete = m.progress >= m.target;
    let nextProgress = m.progress;
    if (m.type === 'solve') {
      nextProgress = Math.min(m.target, m.progress + 1);
    } else if (m.type === 'streak') {
      nextProgress = Math.min(m.target, Math.max(m.progress, currentStreak));
    }
    if (!wasComplete && nextProgress >= m.target) {
      newlyCompletedTitles.push(m.title);
    }
    return { ...m, progress: nextProgress };
  });
  return { missions: updated, newlyCompletedTitles };
}
