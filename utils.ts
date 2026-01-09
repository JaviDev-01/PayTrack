import { RateType, WorkEntry } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2, 
  }).format(amount);
};

export const formatDuration = (totalHours: number): string => {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export const getMonthName = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date);
};

export const formatDateRange = (start: Date, end: Date): string => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setHours(0, 0, 0, 0);
  return new Date(d.setDate(diff));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getRateForDate = (date: Date): number => {
  const day = date.getDay();
  // 0 is Sunday, 6 is Saturday
  const isWeekend = day === 6 || day === 0;
  return isWeekend ? RateType.WEEKEND : RateType.WEEKDAY;
};

export const isWeekendDay = (date: Date): boolean => {
  const day = date.getDay();
  return day === 6 || day === 0;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// New function to export data
export const downloadCSV = (entries: WorkEntry[], userName: string) => {
  const headers = ['Fecha', 'Horas', 'Tarifa', 'Total', 'Nota', 'Tipo'];
  const rows = entries.map(e => [
    e.date,
    e.hours,
    e.rate,
    e.totalEarned,
    `"${e.note || ''}"`,
    e.isWeekend ? 'Fin de semana' : 'Diario'
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `horas_extra_${userName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getBillingCycleRange = (startDay: number): { start: Date, end: Date } => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let start: Date;
  let end: Date;

  if (currentDay < startDay) {
    // Current period started in the previous month
    start = new Date(currentYear, currentMonth - 1, startDay);
    end = new Date(currentYear, currentMonth, startDay - 1);
  } else {
    // Current period started in the current month
    start = new Date(currentYear, currentMonth, startDay);
    end = new Date(currentYear, currentMonth + 1, startDay - 1);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};