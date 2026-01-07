import React, { useState } from 'react';
import { WorkEntry } from '../types';
import { formatCurrency, downloadCSV, formatDuration } from '../utils';
import { Trash2, Download, FileText, Pencil, Filter, Clock } from 'lucide-react';

interface HistoryListProps {
  entries: WorkEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: WorkEntry) => void;
  userName?: string;
}

type FilterType = 'all' | 'weekday' | 'weekend';

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onDelete, onEdit, userName }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'weekend') return entry.isWeekend;
    if (filter === 'weekday') return !entry.isWeekend;
    return true;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Controls Header */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex p-1 bg-gray-50 rounded-xl">
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-400'}`}>Todos</button>
            <button onClick={() => setFilter('weekday')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'weekday' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>L-V</button>
            <button onClick={() => setFilter('weekend')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'weekend' ? 'bg-white shadow text-pink-600' : 'text-gray-400'}`}>Finde</button>
         </div>
         
         <button 
           onClick={() => downloadCSV(sortedEntries, userName || 'user')}
           className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
         >
           <Download size={14} />
         </button>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Filter className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-900 font-bold">Sin registros</p>
          <p className="text-sm text-gray-400 mt-1">No hay horas para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-white rounded-3xl p-5 border border-gray-50 shadow-sm hover:shadow-lg hover:border-gray-100 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                
                {/* Left: Date & Time */}
                <div className="flex items-center gap-4">
                  <div className={`
                    flex flex-col items-center justify-center w-14 h-14 rounded-2xl font-bold
                    ${entry.isWeekend ? 'bg-pink-50 text-pink-600' : 'bg-indigo-50 text-indigo-600'}
                  `}>
                    <span className="text-xl leading-none">{new Date(entry.date).getDate()}</span>
                    <span className="text-[10px] uppercase opacity-60">{new Date(entry.date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</span>
                  </div>

                  <div>
                     <div className="flex items-center gap-2">
                       <p className="text-lg font-black text-gray-900">{formatDuration(entry.hours)}</p>
                       {entry.isWeekend && <div className="w-2 h-2 rounded-full bg-pink-500"></div>}
                     </div>
                     {entry.note ? (
                       <p className="text-sm text-gray-500 flex items-center gap-1 line-clamp-1"><FileText size={12}/> {entry.note}</p>
                     ) : (
                       <p className="text-xs text-gray-400 font-medium">Tarifa: {entry.rate}€</p>
                     )}
                  </div>
                </div>

                {/* Right: Money & Actions */}
                <div className="text-right">
                   <p className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(entry.totalEarned)}</p>
                   
                   <div className="flex justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => onEdit(entry)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(entry.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                   </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};