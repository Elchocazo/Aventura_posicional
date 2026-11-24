export type GameMode = 'add' | 'sub' | 'mix';
export type OperationMode = GameMode;
export type PracticeStyle = 'story' | 'direct';
export type GradeLevel = 2 | 3 | 4 | 5;

export type PositionalCol = 'cm' | 'dm' | 'um' | 'c' | 'd' | 'u';

export type GamePhase = 'placing' | 'calculating' | 'complete';

export interface Chip {
  id: string;
  value: string;
  isDistractor?: boolean;
  isCarry?: boolean;
  used?: boolean;
}

export interface LevelConfig {
  cols: PositionalCol[];
  min1: number;
  max1: number;
  min2: number;
  max2: number;
  label: string;
  goldSec: number;
  silverSec: number;
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  category: 'mascot' | 'accessory' | 'theme';
  bgClass?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
  type: 'solve' | 'streak' | 'perfect';
}

export interface DailyStatsEntry {
  date: string; // YYYY-MM-DD
  solved: number;
  errors: number;
  xp: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  title: string;
  theme: string;
  motto: string;
  points: number;
  totalXp: number;
  equippedMascot: string;
  equippedAccessory: string;
  equippedTheme: string;
  unlockedItems: string[];
  solvedCount: number;
  maxStreak: number;
  dailyStreak: number;
  lastActiveDate: string;
  dailyHistory: DailyStatsEntry[];
  missionsDate: string;
  missions: DailyMission[];
}

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface StoryTheme {
  icon: string;
  addStory: (b1: string, b2: string) => string;
  addQuestion: string;
  addKeyword: string;
  addShort: (b1: string, b2: string) => string;
  subStory: (b1: string, b2: string) => string;
  subQuestion: string;
  subKeyword: string;
  subShort: (b1: string, b2: string) => string;
}

export interface ProblemData {
  num1: number;
  num2: number;
  operation: '+' | '-';
  activeCols: PositionalCol[];
  story: {
    icon: string;
    text: string;
    question: string;
    keyword?: string;
    shortText?: string;
  };
}

export interface TeacherReportStats {
  solvedCount: number;
  maxStreak: number;
  accuracy: number;
  points: number;
  timeSpentSec: number;
}
