export type GameMode = 'add' | 'sub' | 'mix';
export type OperationMode = GameMode;
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
  category: 'mascot' | 'accessory';
}

export interface StoryTheme {
  icon: string;
  addStory: (b1: string, b2: string) => string;
  addQuestion: string;
  subStory: (b1: string, b2: string) => string;
  subQuestion: string;
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
  };
}

export interface TeacherReportStats {
  solvedCount: number;
  maxStreak: number;
  accuracy: number;
  points: number;
  timeSpentSec: number;
}
