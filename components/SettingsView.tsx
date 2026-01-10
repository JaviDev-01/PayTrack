import React from 'react';
import { User, Download, Trash2, Shield, FileText, LogOut, Github, CalendarDays, Coins, FileSpreadsheet } from 'lucide-react';
import { WorkEntry, AppSettings } from '../types';
import { exportToExcel } from '../utils';

interface SettingsViewProps {
  userName: string;
  entries: WorkEntry[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLogout: () => void;
  onClearData: () => void;
  onExportExcel: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userName, entries, settings, onUpdateSettings, onLogout, onClearData, onExportExcel }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <h2 className="text-xl font-bold text-gray-900 px-1">Configuración</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gray-200">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Perfil</p>
            <p className="text-lg font-black text-gray-900">{userName}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
          title="Cerrar Sesión"
        >
        </button>
      </div>

      {/* Income Settings */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
        <div className='flex items-center gap-2'>
           <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg">
             <CalendarDays size={18} />
           </div>
           <h3 className="font-bold text-gray-900">Rango de Ingresos (Inicio)</h3>
        </div>
        
        <div className='flex p-1 bg-gray-50 rounded-xl'>
            <button 
               onClick={() => onUpdateSettings({ ...settings, homeViewMode: 'currentMonth' })}
               className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${settings.homeViewMode === 'currentMonth' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Mes Actual
            </button>
            <button 
               onClick={() => onUpdateSettings({ ...settings, homeViewMode: 'custom' })}
               className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${settings.homeViewMode === 'custom' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Personalizado
            </button>
        </div>

        {settings.homeViewMode === 'currentMonth' && (
             <div className='animate-fade-in'>
                <label className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block px-1'>Día de inicio del ciclo mensual</label>
                <div className='flex items-center gap-3'>
                    <input 
                        type='number' 
                        min="1"
                        max="31"
                        className='w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-indigo-500 transition-colors'
                        value={settings.billingCycleStartDay || 1}
                        onChange={(e) => onUpdateSettings({ ...settings, billingCycleStartDay: parseInt(e.target.value) || 1 })}
                    />
                    <p className='text-[10px] text-gray-400 font-medium'>
                        Ejemplo: Si pones 20, el ciclo será del 20 al 19 del mes siguiente.
                    </p>
                </div>
             </div>
        )}

        {settings.homeViewMode === 'custom' && (
            <div className='grid grid-cols-2 gap-3 animate-fade-in'>
                <div>
                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block px-1'>Desde</label>
                    <input 
                        type='date' 
                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-indigo-500 transition-colors uppercase'
                        value={settings.customStartDate || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, customStartDate: e.target.value })}
                    />
                </div>
                <div>
                     <label className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block px-1'>Hasta</label>
                    <input 
                        type='date' 
                        className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-indigo-500 transition-colors uppercase'
                        value={settings.customEndDate || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, customEndDate: e.target.value })}
                    />
                </div>
            </div>
        )}
      </div>

      {/* Rate Settings */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
        <div className='flex items-center gap-2'>
           <div className="bg-amber-50 text-amber-500 p-2 rounded-lg">
             <Coins size={18} />
           </div>
           <h3 className="font-bold text-gray-900">Tarifas Personalizadas (€/h)</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                   <p className="text-xs font-bold text-gray-900">Lunes a Viernes</p>
                   <p className="text-[10px] text-gray-400 font-medium tracking-wide">Tarifa Estándar</p>
                </div>
                <input 
                    type="number" 
                    step="0.01"
                    className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-indigo-600 text-right outline-none focus:border-indigo-500"
                    value={settings.rateWeekday}
                    onChange={(e) => onUpdateSettings({ ...settings, rateWeekday: parseFloat(e.target.value) || 0 })}
                />
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                   <p className="text-xs font-bold text-gray-900">Sábados</p>
                   <p className="text-[10px] text-gray-400 font-medium tracking-wide">Tarifa Extra Sábado</p>
                </div>
                <input 
                    type="number" 
                    step="0.01"
                    className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-pink-600 text-right outline-none focus:border-pink-500"
                    value={settings.rateSaturday}
                    onChange={(e) => onUpdateSettings({ ...settings, rateSaturday: parseFloat(e.target.value) || 0 })}
                />
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                   <p className="text-xs font-bold text-gray-900">Festivos</p>
                   <p className="text-[10px] text-gray-400 font-medium tracking-wide">Tarifa Especial Festivo</p>
                </div>
                <input 
                    type="number" 
                    step="0.01"
                    className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-amber-600 text-right outline-none focus:border-amber-500"
                    value={settings.rateHoliday}
                    onChange={(e) => onUpdateSettings({ ...settings, rateHoliday: parseFloat(e.target.value) || 0 })}
                />
            </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Datos</p>
        
        <button 
          onClick={onExportExcel}
          className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-emerald-200 group transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
               <FileSpreadsheet size={20} />
             </div>
             <div className="text-left">
               <p className="font-bold text-gray-900">Exportar a Excel</p>
               <p className="text-xs text-gray-400">Descarga tu historial ordenado</p>
             </div>
          </div>
        </button>

        <button 
          onClick={onClearData}
          className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-200 group transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="bg-red-50 text-red-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
               <Trash2 size={20} />
             </div>
             <div className="text-left">
               <p className="font-bold text-red-600">Borrar todo</p>
               <p className="text-xs text-gray-400">Eliminar historial local</p>
             </div>
          </div>
        </button>
      </div>

      {/* Privacy Policy */}
      <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
         <div className="flex items-center gap-2 mb-4">
           <Shield size={20} className="text-emerald-500" />
           <h3 className="font-bold text-gray-900">Política de Privacidad</h3>
         </div>
         <div className="text-sm text-gray-500 space-y-3 leading-relaxed">
           <p>
             <strong>1. Almacenamiento Local:</strong> Mi Extra es una aplicación "Offline-First". Todos tus datos (horas, tarifas, notas) se guardan exclusivamente en la memoria interna de tu dispositivo (LocalStorage).
           </p>
           <p>
             <strong>2. Sin Servidores:</strong> No enviamos tu información a ninguna nube ni base de datos externa. Tú tienes el control total.
           </p>
           <p>
             <strong>3. Exportación:</strong> Puedes descargar una copia de seguridad en CSV en cualquier momento desde el botón de arriba.
           </p>
         </div>
      </div>

      <div className="text-center pt-4 opacity-50">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Mi Extra App v1.2</p>
        <p className="text-xs">By JaviDev - 2026 - All rights reserved</p>
      </div>
    </div>
  );
};
