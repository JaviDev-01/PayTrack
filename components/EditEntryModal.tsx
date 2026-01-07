import React, { useState, useEffect } from 'react';
import { WorkEntry } from '../types';
import { getRateForDate, isWeekendDay, formatCurrency } from '../utils';
import { X, Save, CalendarDays, Clock, PenLine } from 'lucide-react';

interface EditEntryModalProps {
  entry: WorkEntry;
  onClose: () => void;
  onSave: (updatedEntry: WorkEntry) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ entry, onClose, onSave }) => {
  const [date, setDate] = useState(entry.date);
  const [hours, setHours] = useState(entry.hours);
  const [note, setNote] = useState(entry.note || '');
  const [rate, setRate] = useState(entry.rate);
  const [isWeekend, setIsWeekend] = useState(entry.isWeekend);

  useEffect(() => {
    const d = new Date(date);
    setRate(getRateForDate(d));
    setIsWeekend(isWeekendDay(d));
  }, [date]);

  const handleSave = () => {
    onSave({
      ...entry,
      date,
      hours,
      rate,
      isWeekend,
      note,
      totalEarned: hours * rate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up">
        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Editar Registro</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Fecha</label>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <CalendarDays className="text-pro-primary" size={20} />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent w-full font-semibold text-gray-900 outline-none"
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Horas ({hours}h)</label>
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setHours(h => Math.max(0.5, h - 0.5))}
                 className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-lg hover:bg-gray-200"
               >-</button>
               <input 
                 type="range" 
                 min="0.5" 
                 max="24" 
                 step="0.5" 
                 value={hours} 
                 onChange={(e) => setHours(parseFloat(e.target.value))}
                 className="flex-1 accent-pro-primary"
               />
               <button 
                 onClick={() => setHours(h => Math.min(24, h + 0.5))}
                 className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-lg hover:bg-gray-200"
               >+</button>
            </div>
          </div>

          {/* Note */}
          <div>
             <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Nota</label>
             <div className="flex items-center gap-2 border-b border-gray-200 py-2">
               <PenLine size={16} className="text-gray-400" />
               <input 
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 className="w-full outline-none text-sm"
                 placeholder="Sin nota..."
               />
             </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
             <div>
               <p className="text-xs text-gray-400 font-medium">Nuevo Total</p>
               <p className="text-2xl font-bold text-pro-primary">{formatCurrency(hours * rate)}</p>
             </div>
             <button 
               onClick={handleSave}
               className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
             >
               <Save size={18} />
               Guardar
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};