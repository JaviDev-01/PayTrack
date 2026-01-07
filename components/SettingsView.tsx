import React from 'react';
import { User, Download, Trash2, Shield, FileText, LogOut, Github } from 'lucide-react';
import { WorkEntry } from '../types';
import { downloadCSV } from '../utils';

interface SettingsViewProps {
  userName: string;
  entries: WorkEntry[];
  onLogout: () => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userName, entries, onLogout, onClearData }) => {
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
          <LogOut size={20} />
        </button>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Datos</p>
        
        <button 
          onClick={() => downloadCSV(entries, userName)}
          className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-indigo-200 group transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
               <Download size={20} />
             </div>
             <div className="text-left">
               <p className="font-bold text-gray-900">Exportar CSV</p>
               <p className="text-xs text-gray-400">Descarga tu historial completo</p>
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
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Mi Extra App v1.1</p>
        <p className="text-xs">Hecho con ❤️ para organizarse mejor</p>
      </div>
    </div>
  );
};
