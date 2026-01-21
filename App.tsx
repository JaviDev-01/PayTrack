import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateId,
  formatCurrency,
  getStartOfWeek,
  addDays,
  formatDateRange,
  formatDuration,
  getMonthName,
  toLocalISOString,
  getBillingCycleRange,
  exportToExcel,
} from "./utils";
import { WorkEntry, ViewMode, AppSettings, DefaultRates } from "./types";
import { AddHoursForm } from "./components/AddHoursForm";
import { HistoryList } from "./components/HistoryList";
import { StatsChart } from "./components/StatsChart";
import { EditEntryModal } from "./components/EditEntryModal";
import { HelpModal } from "./components/HelpModal";
import { SettingsView } from "./components/SettingsView";
import { NeoCard } from "./components/ui/NeoCard";
import { NeoButton } from "./components/ui/NeoButton";
import {
  History,
  Plus,
  BarChart2,
  LogOut,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Briefcase,
  Coffee,
  Clock,
  ArrowRight,
  Settings,
  TrendingUp,
  DollarSign,
  Percent,
  Target
} from "lucide-react";

import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { OTA } from "./ota";
import { Download, RefreshCw, Smartphone } from "lucide-react";

const USER_KEY = "mi-extra-app-current-user";

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem(USER_KEY),
  );
  const [tempName, setTempName] = useState<string>("");
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [view, setView] = useState<ViewMode>("add");
  const [loading, setLoading] = useState(true);

  // Stats View State
  const [weekOffset, setWeekOffset] = useState(0);

  // Edit State
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  // Month Selection State
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Help Modal State
  const [showHelp, setShowHelp] = useState(false);

  // OTA State
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "available" | "downloading" | "installing" | "ready" | "restarting"
  >("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<any>(null); // To store the full version object from OTA check
  const [appVersion, setAppVersion] = useState<string>("Detectando...");

  // Settings State
  const defaultSettings: AppSettings = {
    homeViewMode: "currentMonth",
    customStartDate: "",
    customEndDate: "",
    billingCycleStartDay: 1,
    rateWeekday: DefaultRates.WEEKDAY,
    rateSaturday: DefaultRates.SATURDAY,
    rateHoliday: DefaultRates.HOLIDAY,
    taxPercentage: 0,
  };
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const storageKey = useMemo(
    () => `mi-extra-app-data-${userName || "default"}`,
    [userName],
  );
  const settingsKey = useMemo(
    () => `mi-extra-app-settings-${userName || "default"}`,
    [userName],
  );

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (userName) {
        // Load Data
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setEntries(parsed);
          } catch (e) {
            setEntries([]);
          }
        } else {
          setEntries([]);
        }

        // Load Settings
        const savedSettings = localStorage.getItem(settingsKey);
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            // MERGE with defaultSettings to ensure new fields like taxPercentage are present
            setSettings({ ...defaultSettings, ...parsedSettings });
          } catch (e) {
            setSettings(defaultSettings);
          }
        } else {
          setSettings(defaultSettings);
        }
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [userName, storageKey, settingsKey]);

  useEffect(() => {
    // CRITICAL: Notify Capacitor Updater that the app is ready.
    // This enables the automatic rollback mechanism if the app fails to load.
    CapacitorUpdater.notifyAppReady();

    // Check for updates on mount
    const checkUpdates = async () => {
      try {
        // Fetch current internal version for UI
        const currentV = await OTA.getCurrentVersion();
        setAppVersion(currentV);

        const update = await OTA.checkForUpdate();
        if (update) {
          setNewVersion(update.version);
          setVersionInfo(update);
          
          // Automatic approach: download and install immediately
          setUpdateStatus("downloading");
          try {
            await OTA.downloadUpdate(update);
            // Auto install after download
            setUpdateStatus("restarting");
            await new Promise(resolve => setTimeout(resolve, 1500));
            await OTA.installUpdate(update);
          } catch (dlErr) {
            console.error("Auto background update failed", dlErr);
            setUpdateStatus("idle");
          }
        }
      } catch (err) {
        console.error("OTA update check failed", err);
      }
    };

    checkUpdates();

    // Listen for download progress
    const progressListener = CapacitorUpdater.addListener(
      "download",
      (info: any) => {
        setUpdateStatus("downloading");
        setDownloadProgress(info.percent);
      },
    );

    return () => {
      progressListener.then((handle) => handle.remove());
    };
  }, []);

  // handleInstallUpdate is no longer needed to be called manually, 
  // but we can trigger it for manual fallbacks if needed.
  const handleInstallUpdate = async () => {
    if (!versionInfo) return;
    setUpdateStatus("restarting");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await OTA.installUpdate(versionInfo);
    } catch (e) {
      console.error("Installation failed", e);
      setUpdateStatus("idle");
    }
  };

  useEffect(() => {
    if (userName && !loading) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    }
  }, [entries, settings, userName, storageKey, settingsKey, loading]);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!tempName.trim()) return;
    localStorage.setItem(USER_KEY, tempName.trim());
    setUserName(tempName.trim());
    setTempName("");
  };

  const handleLogout = () => {
    if (confirm("¿Desea cerrar la sesión actual?")) {
      localStorage.removeItem(USER_KEY);
      setUserName(null);
      setEntries([]);
      setView("add");
      setUserName(null);
      setEntries([]);
      setView("add");
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "¿ATENCIÓN: Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.",
      )
    ) {
      setEntries([]);
      setView("add");
      alert("Datos borrados correctamente.");
    }
  };

  const handleAddEntry = (entryData: Omit<WorkEntry, "id" | "timestamp">) => {
    const newEntry: WorkEntry = {
      ...entryData,
      id: generateId(),
      timestamp: Date.now(),
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleUpdateEntry = (updatedEntry: WorkEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
    );
    setEditingEntry(null);
  };

  // Month Navigation
  const handlePrevMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const isCurrentMonth = (date: Date) => {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  // --- STATS LOGIC ---

  // 1. Home Stats (Configurable)
  const homeStats = useMemo(() => {
    let start: Date, end: Date;

    if (
      settings.homeViewMode === "custom" &&
      settings.customStartDate &&
      settings.customEndDate
    ) {
      start = new Date(settings.customStartDate);
      end = new Date(settings.customEndDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const range = getBillingCycleRange(settings.billingCycleStartDay || 1);
      start = range.start;
      end = range.end;
    }

    const startStr = toLocalISOString(start);
    const endStr = toLocalISOString(end);
    const periodEntries = entries.filter(
      (e) => e.date >= startStr && e.date <= endStr,
    );

    return periodEntries.reduce(
      (acc, curr) => ({
        totalEarned: acc.totalEarned + (curr.totalEarned || 0),
        totalHours: acc.totalHours + (curr.hours || 0),
      }),
      { totalEarned: 0, totalHours: 0 },
    );
  }, [entries, settings]);

  // 2. Weekly Range (Selection)
  const currentWeekStart = useMemo(() => {
    const today = new Date();
    const start = getStartOfWeek(today);
    return addDays(start, weekOffset * 7);
  }, [weekOffset]);

  const currentWeekEnd = useMemo(() => {
    return addDays(currentWeekStart, 6);
  }, [currentWeekStart]);

  // 3. Filtered Stats (For Stats View & History) -> NOW USES SELECTED DATE
  const filteredStats = useMemo(() => {
    // A. Month/Cycle Stats
    const { start: pStart, end: pEnd } = getBillingCycleRange(
      settings.billingCycleStartDay || 1,
      selectedDate,
    );
    const pStartStr = toLocalISOString(pStart);
    const pEndStr = toLocalISOString(pEnd);

    const periodEntries = entries.filter(
      (e) => e.date >= pStartStr && e.date <= pEndStr,
    );
    const uniqueDaysPeriod = new Set(periodEntries.map((e) => e.date));

    const global = periodEntries.reduce(
      (acc, curr) => ({
        totalEarned: acc.totalEarned + (curr.totalEarned || 0),
        totalHours: acc.totalHours + (curr.hours || 0),
        daysWorked: uniqueDaysPeriod.size,
        weekdayHours:
          acc.weekdayHours +
          (!curr.isWeekend && !curr.isHoliday ? curr.hours || 0 : 0),
        weekendHours:
          acc.weekendHours +
          (curr.isWeekend && !curr.isHoliday ? curr.hours || 0 : 0),
        holidayHours: acc.holidayHours + (curr.isHoliday ? curr.hours || 0 : 0),
      }),
      {
        totalHours: 0,
        totalEarned: 0,
        daysWorked: 0,
        weekdayHours: 0,
        weekendHours: 0,
        holidayHours: 0,
      },
    );

    // B. Weekly Stats (for chart)
    const wStartStr = toLocalISOString(currentWeekStart);
    const wEndStr = toLocalISOString(currentWeekEnd);

    const weeklyEntries = entries.filter(
      (e) => e.date >= wStartStr && e.date <= wEndStr,
    );
    const uniqueDaysWeekly = new Set(weeklyEntries.map((e) => e.date));

    const weekly = weeklyEntries.reduce(
      (acc, curr) => ({
        totalEarned: acc.totalEarned + (curr.totalEarned || 0),
        totalHours: acc.totalHours + (curr.hours || 0),
        daysWorked: uniqueDaysWeekly.size,
        weekdayHours:
          acc.weekdayHours +
          (!curr.isWeekend && !curr.isHoliday ? curr.hours || 0 : 0),
        weekendHours:
          acc.weekendHours +
          (curr.isWeekend && !curr.isHoliday ? curr.hours || 0 : 0),
        holidayHours: acc.holidayHours + (curr.isHoliday ? curr.hours || 0 : 0),
      }),
      {
        totalHours: 0,
        totalEarned: 0,
        daysWorked: 0,
        weekdayHours: 0,
        weekendHours: 0,
        holidayHours: 0,
      },
    );

    return {
      global,
      weekly,
      weeklyEntries,
      range: { start: pStart, end: pEnd },
    };
  }, [
    entries,
    settings.billingCycleStartDay,
    selectedDate,
    currentWeekStart,
    currentWeekEnd,
  ]);

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
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-pink-100 rounded-full blur-3xl animate-pulse-soft mix-blend-multiply"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center h-full">
          {/* Logo / Icon */}
          <div
            className="mb-12 opacity-0 animate-slide-up"
            style={{ animationFillMode: "forwards", animationDelay: "0ms" }}
          >
            <div className="w-28 h-28 bg-gray-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 cursor-default">
              <div className="relative">
                <Briefcase className="text-white w-12 h-12" strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16 space-y-4"
          >
            <div className="inline-block bg-gray-900 text-white px-4 py-1.5 rounded-full mb-4 transform rotate-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">PayTrack Pro v{appVersion}</span>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-[0.9]">
              Bienvenido, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                Guerrero.
              </span>
            </h1>
            <p className="text-lg text-gray-400 font-bold leading-tight px-4 mt-4">
              Controla cada minuto de tu esfuerzo y conviértelo en resultados tangibles.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleLogin}
            className="w-full space-y-12"
          >
            <div className="relative group text-center px-4">
              <label
                className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-all duration-500 ${tempName ? "text-indigo-600 translate-y-0 opacity-100" : "text-gray-300 translate-y-4 opacity-50"}`}
              >
                ¿CÓMO DEBEMOS LLAMARTE?
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Escribe tu alias..."
                autoFocus
                className="w-full bg-transparent text-center text-4xl font-black text-gray-900 placeholder-gray-100 outline-none caret-indigo-500 transition-all pb-6 border-b-4 border-gray-50 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-center pt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!tempName.trim()}
                className={`
                    relative w-full max-w-xs bg-gray-900 text-white font-black text-xl py-6 rounded-[2rem] shadow-2xl shadow-gray-300 flex items-center justify-center gap-4 transition-all duration-500 
                    ${
                      tempName.trim()
                        ? "opacity-100 translate-y-0"
                        : "opacity-30 translate-y-4 pointer-events-none"
                    }
                  `}
              >
                <span>ENTRAR</span>
                <div className="bg-indigo-500 p-2 rounded-xl">
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </motion.button>
            </div>
          </motion.form>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-8 left-0 w-full text-center opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards", animationDelay: "800ms" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <ShieldCheck size={12} className="text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Datos guardados en tu móvil
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- OTA UPDATE OVERLAY ---
  const renderUpdateOverlay = () => {
    if (updateStatus === "idle") return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-safe-top">
        <div className="mt-2 bg-gray-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700/50 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-full">
              {updateStatus === "downloading" ? (
                <RefreshCw className="animate-spin text-indigo-400" size={18} />
              ) : updateStatus === "ready" ? (
                <Smartphone className="text-emerald-400" size={18} />
              ) : (
                <Download className="text-indigo-400" size={18} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {updateStatus === "available"
                  ? "Nueva Versión"
                  : updateStatus === "downloading"
                    ? "Descargando..."
                    : updateStatus === "ready"
                      ? "Listo para Instalar"
                      : updateStatus === "installing"
                        ? "Actualizando..."
                        : updateStatus === "restarting"
                          ? "Reiniciando..."
                          : ""}
              </p>
              <p className="text-sm font-semibold">
                {updateStatus === "available"
                  ? `v${newVersion} disponible`
                  : updateStatus === "downloading"
                    ? `${downloadProgress}% completado`
                    : updateStatus === "ready"
                      ? "Toque para instalar"
                      : updateStatus === "restarting"
                        ? "Cerrando aplicación..."
                        : "Preparando..."}
              </p>
            </div>
          </div>

          <div>
            {updateStatus === "ready" && (
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

      {renderUpdateOverlay()}

      {/* Edit Modal */}
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          settings={settings}
          onClose={() => setEditingEntry(null)}
          onSave={handleUpdateEntry}
        />
      )}

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="h-12 w-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-gray-200"
            >
              {userName.charAt(0).toUpperCase()}
            </motion.div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">
                AGENT: {userName.toUpperCase()} • v{appVersion}
              </p>
              <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">
                Estado Actual
              </h1>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-100">
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-4 flex-grow overflow-y-auto no-scrollbar pb-32 relative">
        <AnimatePresence mode="wait">
          {view === "add" && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* MONTHLY Summary Card */}
              <div className="bg-gray-900 rounded-[2.5rem] p-9 shadow-2xl shadow-gray-300 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/90 flex items-center gap-2">
                        <Calendar size={12} strokeWidth={3} />
                        {settings.homeViewMode === "custom"
                          ? settings.customStartDate && settings.customEndDate
                            ? `${settings.customStartDate.split('-').slice(1).reverse().join('/')} - ${settings.customEndDate.split('-').slice(1).reverse().join('/')}`
                            : "Rango Personalizado"
                          : formatDateRange(
                              getBillingCycleRange(settings.billingCycleStartDay || 1).start,
                              getBillingCycleRange(settings.billingCycleStartDay || 1).end,
                            )}
                      </p>
                    </div>
                    <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-400/30">
                      <Percent size={14} className="text-indigo-300" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">Capital Acumulado</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black tracking-tighter">
                        {
                          formatCurrency(
                            homeStats.totalEarned * (1 - (settings.taxPercentage || 0) / 100),
                          ).split(",")[0]
                        }
                      </span>
                      <span className="text-3xl font-black text-white/40">
                        .{
                          formatCurrency(
                            homeStats.totalEarned * (1 - (settings.taxPercentage || 0) / 100),
                          ).split(",")[1].split(" ")[0]
                        }
                      </span>
                      <span className="text-2xl font-black text-indigo-400 ml-1">€</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Horas Totales</p>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-emerald-400" />
                          <span className="text-sm font-black text-white">{formatDuration(homeStats.totalHours)}</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-white/5"></div>
                      <div className="flex flex-col">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Tipo Ciclo</p>
                        <span className="text-sm font-black text-indigo-300 uppercase tracking-tighter">
                          {settings.homeViewMode === "custom" ? "Personalizado" : "Mensual"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AddHoursForm onAdd={handleAddEntry} settings={settings} />
            </motion.div>
          )}

          {view === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">
                Tus Registros
              </h2>
              <HistoryList
                entries={entries}
                onDelete={handleDeleteEntry}
                onEdit={setEditingEntry}
                userName={userName}
              />
            </motion.div>
          )}

          {view === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6 pb-4"
            >
              {/* Month Selector for Stats */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      Estadísticas
                    </h2>
                  </div>
                </div>

                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                  <button
                    onClick={handlePrevMonth}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-3 min-w-[120px] text-center flex flex-col">
                    <span className="text-sm font-black text-gray-900 capitalize leading-tight">
                      {getMonthName(selectedDate)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {formatDateRange(
                        filteredStats.range.start,
                        filteredStats.range.end,
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* 1. Global Stats Card with Gross/Net */}
              <div className="bg-gray-900 rounded-[2.5rem] p-9 shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-8">
                    Análisis de Rendimiento
                  </p>
                  
                  <div className="flex justify-between items-end mb-10">
                    <div className="flex flex-col gap-1">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Balance Neto Total</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black tracking-tighter">
                          {
                            formatCurrency(
                              filteredStats.global.totalEarned *
                                (1 - (settings.taxPercentage || 0) / 100),
                            ).split(",")[0]
                          }
                        </span>
                        <span className="text-2xl font-black text-white/40">
                          .{
                            formatCurrency(
                              filteredStats.global.totalEarned *
                                (1 - (settings.taxPercentage || 0) / 100),
                            ).split(",")[1].split(" ")[0]
                          }
                        </span>
                        <span className="text-xl font-black text-indigo-400 ml-1">€</span>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5 text-right">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Bruto Total</p>
                       <p className="text-lg font-black text-emerald-400/80">
                         {formatCurrency(filteredStats.global.totalEarned)}
                       </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <Clock size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Esfuerzo</p>
                        <p className="text-sm font-black text-white">{formatDuration(filteredStats.global.totalHours)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <Target size={16} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Retención</p>
                        <p className="text-sm font-black text-white">{settings.taxPercentage || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h2 className="text-lg font-bold text-gray-900 px-1">
                  Esta Semana
                </h2>
                {/* Week Selector Control */}
                <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-100">
                  <button
                    onClick={() => setWeekOffset((o) => o - 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-400 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-2">
                    <span className="text-[10px] font-bold text-gray-800 whitespace-nowrap uppercase">
                      {formatDateRange(currentWeekStart, currentWeekEnd)}
                    </span>
                  </div>
                  <button
                    onClick={() => setWeekOffset((o) => o + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-400 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Weekly Detailed Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings Card */}
                <div className="col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Ganancia Semanal
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {formatCurrency(filteredStats.weekly.totalEarned)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <TrendingUp size={24} />
                  </div>
                </div>

                {/* Weekday Hours */}
                <div className="bg-indigo-50 p-5 rounded-[1.8rem] border border-indigo-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-400 uppercase">
                      Diario
                    </span>
                  </div>
                  <p className="text-xl font-black text-indigo-900">
                    {formatDuration(filteredStats.weekly.weekdayHours)}
                  </p>
                </div>

                {/* Weekend/Holiday Hours */}
                <div className="bg-pink-50 p-5 rounded-[1.8rem] border border-pink-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee size={16} className="text-pink-500" />
                    <span className="text-xs font-bold text-pink-400 uppercase">
                      Fatos/Sáb
                    </span>
                  </div>
                  <p className="text-xl font-black text-pink-900">
                    {formatDuration(
                      filteredStats.weekly.weekendHours +
                        filteredStats.weekly.holidayHours,
                    )}
                  </p>
                </div>
              </div>

              {/* Weekly Chart */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Gráfico Diario
                  </h3>
                </div>
                <StatsChart
                  data={filteredStats.weeklyEntries}
                  weekStart={currentWeekStart}
                />
              </div>
            </motion.div>
          )}

          {view === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SettingsView
                userName={userName}
                entries={entries}
                settings={settings}
                onUpdateSettings={setSettings}
                onLogout={handleLogout}
                onClearData={handleClearData}
                onExportExcel={() => exportToExcel(entries, userName)}
                onOpenHelp={() => setShowHelp(true)}
                appVersion={appVersion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        appVersion={appVersion}
      />

      {/* RESTORED BOTTOM NAVIGATION (FIXED BAR) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-stretch pb-safe z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setView("add")}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === "add"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 ${view === "add" ? "bg-gray-100" : "group-hover:bg-gray-50"}`}
          >
            <Plus size={24} strokeWidth={view === "add" ? 3 : 2} />
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === "add" ? "opacity-100" : "opacity-0 h-0"}`}
          >
            REGISTRAR
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setView("history")}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === "history"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 ${view === "history" ? "bg-gray-100" : "group-hover:bg-gray-50"}`}
          >
            <History size={24} strokeWidth={view === "history" ? 3 : 2} />
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === "history" ? "opacity-100" : "opacity-0 h-0"}`}
          >
            HISTORIAL
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setView("stats")}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === "stats"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 ${view === "stats" ? "bg-gray-100" : "group-hover:bg-gray-50"}`}
          >
            <BarChart2 size={24} strokeWidth={view === "stats" ? 3 : 2} />
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === "stats" ? "opacity-100" : "opacity-0 h-0"}`}
          >
            DATOS
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setView("settings")}
          className={`flex-1 py-3 pt-4 flex flex-col items-center justify-center gap-1.5 transition-all group ${
            view === "settings"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 ${view === "settings" ? "bg-gray-100" : "group-hover:bg-gray-50"}`}
          >
            <Settings size={24} strokeWidth={view === "settings" ? 3 : 2} />
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${view === "settings" ? "opacity-100" : "opacity-0 h-0"}`}
          >
            AJUSTES
          </span>
        </motion.button>
      </nav>
    </div>
  );
};

export default App;
