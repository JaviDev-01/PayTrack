
export interface WorkEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  hours: number;
  rate: number;
  totalEarned: number;
  isWeekend: boolean;
  isHoliday?: boolean; // New field for holiday
  timestamp: number;
  note?: string; 
}

export interface SummaryStats {
  totalHours: number;
  totalEarned: number;
  daysWorked: number;
  weekdayHours: number;
  weekendHours: number;
  holidayHours: number; // New breakdown
}

export enum DefaultRates {
  WEEKDAY = 11.88,
  SATURDAY = 14.52,
  HOLIDAY = 15.84
}

export type ViewMode = 'add' | 'history' | 'stats' | 'settings';

export interface AppSettings {
  homeViewMode: 'currentMonth' | 'custom';
  customStartDate: string; // YYYY-MM-DD
  customEndDate: string;   // YYYY-MM-DD
  billingCycleStartDay: number; // 1-31
  rateWeekday: number;
  rateSaturday: number;
  rateHoliday: number;
}
