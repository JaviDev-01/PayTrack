import React, { useState, useEffect, useMemo } from 'react';
import { generateId, formatCurrency, getStartOfWeek, addDays, formatDateRange, formatDuration, getMonthName } from './utils';
import { WorkEntry, ViewMode } from './types';
import { AddHoursForm } from './components/AddHoursForm';
import { HistoryList } from './components/HistoryList';
import { StatsChart } from './components/StatsChart';
import { EditEntryModal } from './components/EditEntryModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { SettingsView } from './components/SettingsView';
import { NeoCard } from './components/ui/NeoCard';
import { NeoButton } from './components/ui/NeoButton';
import { History, Plus, BarChart2, LogOut, User, ShieldCheck, ChevronLeft, ChevronRight, Calendar, Sparkles, Briefcase, Coffee, Clock, ArrowRight, Settings, TrendingUp, DollarSign } from 'lucide-react';

import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { OTA } from './ota';
import { Download, RefreshCw, Smartphone } from 'lucide-react';

const USER_KEY = 'mi-extra-app-current-user';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem(USER_KEY));
  const [tempName, setTempName] = useState<string>('');
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [view, setView] = useState<ViewMode>('add');
  const [loading, setLoading] = useState(true);

  // Stats View State
  const [weekOffset, setWeekOffset] = useState(0);

  // Edit State
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // OTA State
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'available' | 'downloading' | 'installing' | 'ready'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<any>(null); // To store the full version object from OTA check

  const storageKey = useMemo(() => `mi-extra-app-data-${userName || 'default'}`, [userName]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (userName) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setEntries(parsed);
            if (parsed.length === 0) {
              setShowTutorial(true);
              setTutorialStep(0);
            }
          } catch (e) {
            setEntries([]);
            setShowTutorial(true);
          }
        } else {
          setEntries([]);
          setShowTutorial(true);
        }
      }
      setLoading(false);
    }, 400); 
    return () => clearTimeout(timer);
  }, [userName, storageKey]);

  useEffect(() => {
    // Check for updates on mount
    const checkUpdates = async () => {
      const update = await OTA.checkForUpdate();
      if (update) {
        setNewVersion(update.version);
        setVersionInfo(update);
        setUpdateStatus('available');
      }
    };
    
    checkUpdates();

    // Listen for download progress
    const progressListener = CapacitorUpdater.addListener('download', (info: any) => {
      setUpdateStatus('downloading');
      setDownloadProgress(info.percent);
    });



    return () => {
      progressListener.then(handle => handle.remove());
    };
  }, []);

  const handleStartUpdate = async () => {
    if (!versionInfo) return;
    setUpdateStatus('downloading');
    try {
      await OTA.downloadUpdate(versionInfo);
      setUpdateStatus('ready');
    } catch (e) {
      console.error("Download failed", e);
      setUpdateStatus('idle'); // Reset on failure
      alert('Error en la descarga. Inténtalo más tarde.');
    }
  };

  const handleInstallUpdate = async () => {
    setUpdateStatus('installing');
    // Aesthetic delay for "Install" message reading
    setTimeout(async () => {
      await OTA.installUpdate(versionInfo);
    }, 1000);
  };

  useEffect(() => {
    if (userName && !loading) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }
  }, [entries, userName, storageKey, loading]);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!tempName.trim()) return;
    localStorage.setItem(USER_KEY, tempName.trim());
    setUserName(tempName.trim());
    setTempName('');
  };

  const handleLogout = () => {
    if (confirm('¿Desea cerrar la sesión actual?')) {
      localStorage.removeItem(USER_KEY);
      setUserName(null);
      setEntries([]);
      setView('add');
      setShowTutorial(false);
    }
  };

  const handleClearData = () => {
    if (confirm('¿ATENCIÓN: Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
      setEntries([]);
      setView('add');
      alert('Datos borrados correctamente.');
    }
  };

  const handleAddEntry = (entryData: Omit<WorkEntry, 'id' | 'timestamp'>) => {
    const newEntry: WorkEntry = {
      ...entryData,
      id: generateId(),
      timestamp: Date.now()
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleUpdateEntry = (updatedEntry: WorkEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setEditingEntry(null);
  };

  // Tutorial Logic
  const handleTutorialNext = () => {
    setTutorialStep(prev => prev + 1);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  // --- STATS LOGIC ---
  
  // 1. Current Month Stats (For Home Screen)
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return monthEntries.reduce((acc, curr) => ({
      totalEarned: acc.totalEarned + curr.totalEarned,
      totalHours: acc.totalHours + curr.hours,
    }), { totalEarned: 0, totalHours: 0 });
  }, [entries]);

  // 2. Weekly & Global Stats (For Stats Screen)
  const currentWeekStart = useMemo(() => {
    const today = new Date();
    const start = getStartOfWeek(today);
    return addDays(start, weekOffset * 7);
  }, [weekOffset]);

  const currentWeekEnd = useMemo(() => {
    return addDays(currentWeekStart, 6);
  }, [currentWeekStart]);

  const filteredStats = useMemo(() => {
    // Global stats
    const global = entries.reduce((acc, curr) => ({
      totalHours: acc.totalHours + curr.hours,
      totalEarned: acc.totalEarned + curr.totalEarned,
      daysWorked: acc.daysWorked + 1,
      weekdayHours: acc.weekdayHours + (curr.isWeekend ? 0 : curr.hours),
      weekendHours: acc.weekendHours + (curr.isWeekend ? curr.hours : 0)
    }), { totalHours: 0, totalEarned: 0, daysWorked: 0, weekdayHours: 0, weekendHours: 0 });

    const startStr = currentWeekStart.toISOString().split('T')[0];
    const endStr = currentWeekEnd.toISOString().split('T')[0];

    const weeklyEntries = entries.filter(e => e.date >= startStr && e.date <= endStr);
    
    const weekly = weeklyEntries.reduce((acc, curr) => ({
      totalHours: acc.totalHours + curr.hours,
      totalEarned: acc.totalEarned + curr.totalEarned,
      daysWorked: acc.daysWorked + 1,
      weekdayHours: acc.weekdayHours + (curr.isWeekend ? 0 : curr.hours),
      weekendHours: acc.weekendHours + (curr.isWeekend ? curr.hours : 0)
    }), { totalHours: 0, totalEarned: 0, daysWorked: 0, weekdayHours: 0, weekendHours: 0 });

    return { global, weekly, weeklyEntries };
  }, [entries, currentWeekStart, currentWeekEnd]);


  // --- LOADING SCREEN ---
  if (loading && userName) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
      </div>
    );
  }

  // --- LOGIN SCREEN (Immersive) ---
  if (!userName) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-100 rounded-full blur-3xl animate-pulse-soft mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-pink-100 rounded-full blur-3xl animate-pulse-soft mix-blend-multiply" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center h-full">
          
          {/* Logo / Icon */}
          <div className="mb-12 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards', animationDelay: '0ms' }}>
             <div className="w-28 h-28 bg-gray-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 cursor-default">
               <div className="relative">
                  <Briefcase className="text-white w-12 h-12" strokeWidth={1.5} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
               </div>
             </div>
          </div>

          {/* Text */}
          <div className="text-center mb-16 space-y-3 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards', animationDelay: '200ms' }}>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">
              Hola, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Mi Extra</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium">Tu tiempo vale dinero.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-12 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards', animationDelay: '400ms' }}>
            
            <div className="relative group text-center">
               <label className={`block text-xs font-bold uppercase tracking-widest mb-4 transition-all duration-300 ${tempName ? 'text-indigo-600 translate-y-0 opacity-100' : 'text-gray-300 translate-y-4 opacity-0'}`}>
                 ¿Cómo te llamas?
               </label>
               <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Tu Nombre..."
                  autoFocus
                  className="w-full bg-transparent text-center text-5xl font-black text-gray-900 placeholder-gray-200 outline-none caret-indigo-500 transition-all pb-4 border-b-2 border-transparent focus:border-gray-100"
                />
            </div>

            <div className="h-20 flex items-end justify-center">
               <button 
                  type="submit" 
                  disabled={!tempName.trim()}
                  className={`
                    group relative w-full bg-gray-900 text-white font-bold text-xl py-6 rounded-[2.5rem] shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                    ${tempName.trim() 
                      ? 'opacity-100 translate-y-0 hover:scale-[1.02] active:scale-[0.98]' 
                      : 'opacity-0 translate-y-10 pointer-events-none'}
                  `}
                >
                  <span>Comenzar</span>
                  <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                     <ArrowRight size={20} />
                  </div>
                </button>
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 w-full text-center opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '800ms' }}>
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
             <ShieldCheck size={12} className="text-gray-400" />
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Datos guardados en tu móvil</p>
           </div>
        </div>
      </div>
    );
  }

  // --- OTA UPDATE OVERLAY ---
  const renderUpdateOverlay = () => {
    if (updateStatus === 'idle') return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-safe-top">
        <div className="mt-2 bg-gray-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700/50 flex items-center justify-between animate-slide-down">
           <div className="flex items-center gap-3">
             <div className="bg-indigo-500/20 p-2 rounded-full">
               {updateStatus === 'downloading' ? <RefreshCw className="animate-spin text-indigo-400" size={18} /> : 
                updateStatus === 'ready' ? <Smartphone className="text-emerald-400" size={18} /> :
                <Download className="text-indigo-400" size={18} />}
             </div>
             <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                 {updateStatus === 'available' ? 'Nueva Versión' :
                  updateStatus === 'downloading' ? 'Descargando...' :
                  updateStatus === 'ready' ? 'Listo para Instalar' : 
                  updateStatus === 'installing' ? 'Actualizando...' : ''}
               </p>
               <p className="text-sm font-semibold">
                 {updateStatus === 'available' ? `v${newVersion} disponible` : 
                  updateStatus === 'downloading' ? `${downloadProgress}% completado` :
                  updateStatus === 'ready' ? 'Reiniciar app' :
                  'Preparando...'}
               </p>
             </div>
           </div>

           <div>
              {updateStatus === 'available' && (
                <button 
                  onClick={handleStartUpdate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Descargar
                </button>
              )}
              {updateStatus === 'ready' && (
                <button 
                  onClick={handleInstallUpdate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Instalar
                </button>
              )}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFDFD] flex flex-col relative font-sans">
      
      {renderUpdateOverlay()}
      
      {/* Tutorial Overlay */}
      <TutorialOverlay 
        active={showTutorial} 
        step={tutorialStep} 
        onNext={handleTutorialNext}
        onSkip={handleTutorialSkip}
      />

      {/* Edit Modal */}
      {editingEntry && (
        <EditEntryModal 
          entry={editingEntry} 
          onClose={() => setEditingEntry(null)} 
          onSave={handleUpdateEntry} 
        />
      )}

      {/* Header */}
      <header className="px-6 pt-12 pb-2 flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                {userName.charAt(0).toUpperCase()}
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hola,</p>
               <h1 className="text-xl font-black text-gray-900 tracking-tight">{userName}</h1>
             </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-4 flex-grow overflow-y-auto no-scrollbar pb-32">
        
        {view === 'add' && (
           <div className="animate-fade-in space-y-6">
              {/* MONTHLY Summary Card (Now Specific to Current Month) */}
              <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-8">
                     <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                       <p className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                         <Calendar size={12} />
                         {getMonthName(new Date())}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex flex-col gap-1">
                      <span className="text-5xl font-black tracking-tight">{formatCurrency(currentMonthStats.totalEarned).split(',')[0]}<span className="text-2xl text-white/40">,{formatCurrency(currentMonthStats.totalEarned).split(',')[1]}</span></span>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={14} className="text-white/40" />
                        <p className="text-sm font-medium text-white/60"><span className="text-white font-bold">{formatDuration(currentMonthStats.totalHours)}</span> este mes</p>
                      </div>
                   </div>
                </div>
              </div>

              <AddHoursForm onAdd={handleAddEntry} />
           </div>
        )}

        {view === 'history' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">Tus Registros</h2>
            <HistoryList 
              entries={entries} 
              onDelete={handleDeleteEntry} 
              onEdit={setEditingEntry} 
              userName={userName} 
            />
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-6 animate-fade-in pb-4">
             {/* 1. Global Stats Card (Moved Here) */}
             <div className="bg-gray-900 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Acumulado</p>
                    <p className="text-3xl font-black">{formatCurrency(filteredStats.global.totalEarned)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-400">{formatDuration(filteredStats.global.totalHours)}</p>
                    <p className="text-[10px] text-gray-500">Horas totales</p>
                  </div>
               </div>
             </div>

            <div className="flex items-center justify-between pt-2">
               <h2 className="text-lg font-bold text-gray-900 px-1">Esta Semana</h2>
               {/* Week Selector Control */}
               <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-100">
                  <button onClick={() => setWeekOffset(o => o - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-2">
                    <span className="text-[10px] font-bold text-gray-800 whitespace-nowrap uppercase">
                       {formatDateRange(currentWeekStart, currentWeekEnd)}
                    </span>
                  </div>
                  <button onClick={() => setWeekOffset(o => o + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                    <ChevronRight size={16} />
                  </button>
               </div>
            </div>

            {/* Weekly Detailed Cards */}
            <div className="grid grid-cols-2 gap-4">
               {/* Earnings Card */}
               <div className="col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ganancia Semanal</p>
                     <p className="text-3xl font-black text-gray-900">{formatCurrency(filteredStats.weekly.totalEarned)}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <TrendingUp size={24} />
                  </div>
               </div>

               {/* Weekday Hours */}
               <div className="bg-indigo-50 p-5 rounded-[1.8rem] border border-indigo-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-400 uppercase">Diario</span>
                  </div>
                  <p className="text-xl font-black text-indigo-900">{formatDuration(filteredStats.weekly.weekdayHours)}</p>
               </div>

               {/* Weekend Hours */}
               <div className="bg-pink-50 p-5 rounded-[1.8rem] border border-pink-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee size={16} className="text-pink-500" />
                    <span className="text-xs font-bold text-pink-400 uppercase">Finde</span>
                  </div>
                  <p className="text-xl font-black text-pink-900">{formatDuration(filteredStats.weekly.weekendHours)}</p>
               </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Gráfico Diario</h3>
               </div>
               <StatsChart data={filteredStats.weeklyEntries} weekStart={currentWeekStart} />
            </div>
          </div>
        )}

        {view === 'settings' && (
          <SettingsView 
            userName={userName} 
            entries={entries} 
            onLogout={handleLogout} 
            onClearData={handleClearData}
          />
        )}
      </main>

      {/* RESTORED BOTTOM NAVIGATION (FIXED BAR) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-stretch pb-safe z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setView('add')}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === 'add' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${view === 'add' ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}>
             <Plus size={24} strokeWidth={view === 'add' ? 3 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === 'add' ? 'opacity-100' : 'opacity-0 h-0'}`}>REGISTRAR</span>
        </button>

        <button 
          onClick={() => setView('history')}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === 'history' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${view === 'history' ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}>
             <History size={24} strokeWidth={view === 'history' ? 3 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === 'history' ? 'opacity-100' : 'opacity-0 h-0'}`}>HISTORIAL</span>
        </button>

        <button 
          onClick={() => setView('stats')}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === 'stats' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${view === 'stats' ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}>
             <BarChart2 size={24} strokeWidth={view === 'stats' ? 3 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === 'stats' ? 'opacity-100' : 'opacity-0 h-0'}`}>DATOS</span>
        </button>

        <button 
          onClick={() => setView('settings')}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === 'settings' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${view === 'settings' ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}>
             <Settings size={24} strokeWidth={view === 'settings' ? 3 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === 'settings' ? 'opacity-100' : 'opacity-0 h-0'}`}>AJUSTES</span>
        </button>
      </nav>
    </div>
  );
};

export default App;