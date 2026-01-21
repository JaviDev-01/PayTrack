import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Shield, 
  FileText, 
  LogOut, 
  CalendarDays, 
  Coins, 
  FileSpreadsheet, 
  User, 
  ChevronRight,
  Info,
  ExternalLink,
  Settings as SettingsIcon,
  Percent,
  Smartphone
} from 'lucide-react';
import { WorkEntry, AppSettings } from '../types';

interface SettingsViewProps {
  userName: string;
  entries: WorkEntry[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLogout: () => void;
  onClearData: () => void;
  onExportExcel: () => void;
  onOpenHelp: () => void;
  appVersion: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  userName, 
  entries, 
  settings, 
  onUpdateSettings, 
  onLogout, 
  onClearData, 
  onExportExcel,
  onOpenHelp,
  appVersion
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-28 px-0.5"
    >
      <header className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ajustes</h2>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">v{appVersion}</span>
        </div>
      </header>

      {/* --- SECCIÓN PERFIL --- */}
      <motion.div variants={itemVariants} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-900 to-gray-700 rounded-[2.5rem] opacity-5 group-hover:opacity-10 transition duration-500"></div>
        <div className="relative bg-white rounded-[2.2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-16 w-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-gray-200 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 rounded-full border-4 border-white"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Usuario Activo</p>
              <p className="text-xl font-black text-gray-900 tracking-tight">{userName}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
          >
            <LogOut size={22} strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.div>

      {/* --- PREFERENCIAS DE CÁLCULO --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <SettingsIcon size={16} className="text-indigo-500" />
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Preferencias</h3>
        </div>

        <motion.div variants={itemVariants} className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-gray-100 space-y-6">
          {/* Cálculo Mode Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-500" />
                <span className="text-sm font-bold text-gray-900">Modo de Visualización</span>
              </div>
            </div>
            
            <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
              <button 
                onClick={() => onUpdateSettings({ ...settings, homeViewMode: 'currentMonth' })}
                className={`flex-1 py-3 rounded-[1rem] text-[11px] font-black transition-all ${settings.homeViewMode === 'currentMonth' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                CICLO MENSUAL
              </button>
              <button 
                onClick={() => onUpdateSettings({ ...settings, homeViewMode: 'custom' })}
                className={`flex-1 py-3 rounded-[1rem] text-[11px] font-black transition-all ${settings.homeViewMode === 'custom' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                PERSONALIZADO
              </button>
            </div>
          </div>

          {/* Dynamic Range Controls */}
          <div className="pt-2">
            {settings.homeViewMode === 'currentMonth' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Día de Inicio</label>
                    <input 
                      type="number" min="1" max="31"
                      className="w-full bg-transparent text-lg font-black text-gray-900 outline-none"
                      value={settings.billingCycleStartDay || 1}
                      onChange={(e) => onUpdateSettings({ ...settings, billingCycleStartDay: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="bg-gray-100/50 p-4 rounded-2xl border border-gray-100 space-y-2 opacity-60">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Día de Fin</label>
                    <p className="text-lg font-black text-gray-400">{settings.billingCycleStartDay || 1}</p>
                  </div>
                </div>
                <div className="flex gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                  <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-indigo-900/60 font-bold leading-relaxed tracking-wide">
                    El ciclo empieza el día {settings.billingCycleStartDay || 1} y se cierra cuando llega el mismo día del mes siguiente.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Fecha Inicio</label>
                  <input 
                    type="date"
                    className="w-full bg-transparent text-xs font-black text-gray-900 outline-none uppercase"
                    value={settings.customStartDate || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, customStartDate: e.target.value })}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Fecha Fin</label>
                  <input 
                    type="date"
                    className="w-full bg-transparent text-xs font-black text-gray-900 outline-none uppercase"
                    value={settings.customEndDate || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, customEndDate: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* IRPF Config */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-gray-900">Impuestos (IRPF)</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                NETO vs BRUTO
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="number" min="0" max="100" step="0.5"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-xl font-black text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all pr-12"
                  value={settings.taxPercentage || 0}
                  onChange={(e) => onUpdateSettings({ ...settings, taxPercentage: parseFloat(e.target.value) || 0 })}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-black text-gray-300">%</span>
              </div>
              <p className="flex-1 text-[11px] text-gray-400 font-bold leading-normal">
                Este porcentaje se restará automáticamente del total acumulado en la pantalla de datos.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- TARIFAS SECTOR --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Coins size={16} className="text-amber-500" />
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tarifas por Hora</h3>
        </div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3">
          {[
            { label: 'Diario', sub: 'Lunes a Viernes', value: settings.rateWeekday, color: 'indigo', key: 'rateWeekday' },
            { label: 'Sábados', sub: 'Extra Sábado', value: settings.rateSaturday, color: 'pink', key: 'rateSaturday' },
            { label: 'Festivos', sub: 'Día Especial', value: settings.rateHoliday, color: 'amber', key: 'rateHoliday' }
          ].map((rate) => (
            <div key={rate.key} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 bg-${rate.color}-50 text-${rate.color}-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{rate.label}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{rate.sub}</p>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="number" step="0.01"
                  className={`w-28 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-black text-${rate.color}-600 text-right outline-none focus:bg-white focus:border-${rate.color}-500 transition-all pr-8`}
                  value={rate.value}
                  onChange={(e) => onUpdateSettings({ ...settings, [rate.key]: parseFloat(e.target.value) || 0 })}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-${rate.color}-300`}>€</span>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* --- ACCIONES Y GESTIÓN --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Shield size={16} className="text-emerald-500" />
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Gestión y Datos</h3>
        </div>

        <motion.div variants={itemVariants} className="bg-white rounded-[2.2rem] p-2 shadow-sm border border-gray-100 overflow-hidden">
          <button 
            onClick={onOpenHelp}
            className="w-full flex items-center justify-between p-5 hover:bg-indigo-50/50 transition-colors rounded-3xl"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-gray-900">Centro de Ayuda</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Manual y Video-Tutoriales</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <div className="h-px bg-gray-50 mx-6"></div>

          <button 
            onClick={onExportExcel}
            className="w-full flex items-center justify-between p-5 hover:bg-emerald-50/50 transition-colors rounded-3xl"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-gray-900">Exportar Excel</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Beta • Historial Completo</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-gray-300" strokeWidth={3} />
          </button>

          <div className="h-px bg-gray-50 mx-6"></div>

          <button 
            onClick={onClearData}
            className="w-full flex items-center justify-between p-5 hover:bg-red-50/30 transition-colors rounded-3xl group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trash2 size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-red-600">Borrar Base de Datos</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Eliminar permanentemente</p>
              </div>
            </div>
            <Trash2 size={18} className="text-red-200 group-hover:text-red-300" />
          </button>
        </motion.div>
      </section>

      {/* Privacy Notice Card */}
      <motion.div variants={itemVariants} className="bg-gray-900 rounded-[2.2rem] p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Shield size={120} />
        </div>
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
             <div className="bg-white/10 p-2 rounded-xl">
               <Shield size={20} className="text-emerald-400" />
             </div>
             <h3 className="text-lg font-black text-white tracking-tight">Privacidad Total</h3>
           </div>
           <p className="text-xs text-gray-400 font-bold leading-relaxed mb-4">
             Tus datos nunca salen de tu dispositivo. No usamos servidores externos, por lo que tus horas y ganancias están 100% seguras y bajo tu control.
           </p>
           <div className="pt-4 border-t border-white/10 flex items-center justify-between">
             <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Estado del Sistema</p>
             <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase italic">Protegido</span>
             </div>
           </div>
        </div>
      </motion.div>

      {/* Footer Signature */}
      <footer className="text-center pt-8 space-y-4">
        <div className="inline-flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-4 w-4 bg-gray-900 rounded-sm"></div>
             <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">PAYTRACK APP</p>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest tracking-[0.1em]">By JaviDev • 2026</p>
        </div>
        <div className="flex flex-col gap-1 items-center justify-center opacity-30">
          <p className="text-[9px] font-bold uppercase">Diseñada con mucho cariño y esfuerzo</p>
          <div className="flex items-center gap-2">
            <Smartphone size={8} />
            <p className="text-[8px] font-bold uppercase tracking-tighter text-indigo-600">Optimizada para Android</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

