import React, { useState, useEffect } from 'react';
import { getRateForDate, isWeekendDay, formatCurrency, formatDuration } from '../utils';
import { WorkEntry } from '../types';
import { Plus, Minus, CalendarDays, PenLine } from 'lucide-react';

interface AddHoursFormProps {
  onAdd: (entry: Omit<WorkEntry, 'id' | 'timestamp'>) => void;
}

export const AddHoursForm: React.FC<AddHoursFormProps> = ({ onAdd }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [isWeekend, setIsWeekend] = useState<boolean>(false);

  useEffect(() => {
    const dateObj = new Date(date);
    const rate = getRateForDate(dateObj);
    setCurrentRate(rate);
    setIsWeekend(isWeekendDay(dateObj));
  }, [date]);

  const handleAdd = () => {
    if (hours <= 0) return;
    
    onAdd({
      date,
      hours,
      rate: currentRate,
      isWeekend,
      totalEarned: hours * currentRate,
      note: note.trim()
    });

    setHours(1);
    setNote('');
  };

  const increment = () => setHours(h => Math.min(h + 0.5, 24));
  const decrement = () => setHours(h => Math.max(h - 0.5, 0.5));
  const setExactHours = (h: number) => setHours(h);
  const totalPreview = hours * currentRate;

  return (
    <div className="space-y-4 animate-slide-up pb-8 relative z-10">
      
      {/* 1. Date & Rate Row */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Fecha</label>
           <div className="flex items-center gap-2">
             <CalendarDays className="w-5 h-5 text-gray-400" />
             <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none font-bold text-gray-900 text-sm"
              />
           </div>
        </div>
        <div className={`flex-1 p-5 rounded-3xl border shadow-sm flex flex-col justify-center transition-all duration-300 ${isWeekend ? 'bg-pink-50 border-pink-100' : 'bg-indigo-50 border-indigo-100'}`}>
           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Tarifa {isWeekend ? 'Extra' : 'Std'}</label>
           <div className="flex items-baseline gap-1">
             <span className={`text-2xl font-black ${isWeekend ? 'text-pink-600' : 'text-indigo-600'}`}>{currentRate}€</span>
             <span className="text-xs font-bold text-gray-400">/h</span>
           </div>
        </div>
      </div>

      {/* 2. Main Hours Selector */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-300 mb-8">Horas Trabajadas</label>
          
          <div className="flex items-center justify-center gap-6 mb-10">
            <button 
              onClick={decrement}
              className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center active:scale-95 shadow-sm border border-gray-100 group"
            >
              <Minus size={28} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
            
            <div className="w-48 relative flex items-center justify-center">
               <span className="text-5xl font-black text-gray-900 tracking-tighter tabular-nums">
                 {formatDuration(hours)}
               </span>
            </div>

            <button 
              onClick={increment}
              className="w-16 h-16 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all flex items-center justify-center active:scale-95 shadow-lg shadow-gray-300 group"
            >
              <Plus size={28} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Quick Chips */}
          <div className="flex justify-center gap-3 mb-2">
             {[4, 5, 6, 8].map(h => (
               <button
                 key={h}
                 onClick={() => setExactHours(h)}
                 className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${hours === h ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
               >
                 {h}
               </button>
             ))}
          </div>
        </div>

        {/* Note Section */}
        <div className="bg-gray-50 border-t border-gray-100 p-4">
           <div className="flex items-center gap-3 px-4 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <PenLine className="text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Añadir nota (ej. Cierre)..."
                className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-300 text-sm font-medium"
              />
           </div>
        </div>
      </div>

      {/* 3. Submit Button */}
      <button 
        onClick={handleAdd}
        className="w-full bg-gray-900 text-white rounded-[2rem] p-4 shadow-xl shadow-gray-300 transition-all active:scale-[0.98] group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <div className="relative flex items-center justify-between px-4">
          <div className="flex flex-col items-start">
             <span className="text-[10px] uppercase font-bold text-gray-400">Total a ganar</span>
             <span className="text-2xl font-bold">{formatCurrency(totalPreview).replace(',00', '')}</span>
          </div>
          <div className="flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-xl">
             <span>Guardar</span>
             <Plus size={18} strokeWidth={3} />
          </div>
        </div>
      </button>

    </div>
  );
};