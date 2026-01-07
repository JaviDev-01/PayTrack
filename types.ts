
export interface WorkEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  hours: number;
  rate: number;
  totalEarned: number;
  isWeekend: boolean;
  timestamp: number;
  note?: string; // New field for description
}

export interface SummaryStats {
  totalHours: number;
  totalEarned: number;
  daysWorked: number;
  weekdayHours: number; // New breakdown
  weekendHours: number; // New breakdown
}

export enum RateType {
  WEEKDAY = 10,
  WEEKEND = 14
}

export type ViewMode = 'add' | 'history' | 'stats' | 'settings';
