import React from 'react';
import { Calendar, Clock, Save, ChevronRight, CheckCircle2, X } from 'lucide-react';

interface TutorialOverlayProps {
  active: boolean;
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ active, step, onNext, onSkip }) => {
  if (!active) return null;

  const steps = [
    {
      icon: <CheckCircle2 size={48} className="text-indigo-600" />,
      title: "Bienvenido a Mi Extra",
      desc: "La forma más rápida y elegante de controlar tus horas extra y saber exactamente cuánto vas a cobrar.",
      buttonText: "Empezar Tour"
    },
    {
      icon: <Calendar size={48} className="text-blue-500" />,
      title: "Selección Inteligente",
      desc: "Elige la fecha. La app detecta automáticamente si es fin de semana o festivo para aplicar la tarifa correcta.",
      buttonText: "Siguiente"
    },
    {
      icon: <Clock size={48} className="text-pink-500" />,
      title: "Control de Tiempo",
      desc: "Usa el selector para ajustar tus horas. Hemos simplificado el formato a '1h 30m' para que sea más claro.",
      buttonText: "Siguiente"
    },
    {
      icon: <Save size={48} className="text-emerald-500" />,
      title: "Todo listo",
      desc: "Pulsa el botón grande de 'Guardar' para registrar tu actividad. Tus datos se guardan seguros en tu dispositivo.",
      buttonText: "Finalizar Tutorial"
    }
  ];

  const currentContent = steps[step] || steps[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      {/* Dark Blur Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" />

      {/* Main Card */}
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-slide-up overflow-hidden">
        
        {/* Close Button (Skip) */}
        <button 
          onClick={onSkip}
          className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          {/* Icon Container with Glow */}
          <div className="relative mb-8 group">
             <div className="absolute inset-0 bg-current opacity-20 blur-2xl rounded-full scale-150 transition-transform duration-700 group-hover:scale-175 text-indigo-200"></div>
             <div className="relative bg-gray-50 p-6 rounded-[2rem] shadow-inner">
               {currentContent.icon}
             </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
            {currentContent.title}
          </h2>
          
          <p className="text-gray-500 font-medium leading-relaxed mb-8 min-h-[80px]">
            {currentContent.desc}
          </p>

          {/* Dots Indicator */}
          {step > 0 && (
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-gray-900' : 'w-2 bg-gray-200'}`} 
                />
              ))}
            </div>
          )}

          <button 
            onClick={step === 3 ? onSkip : onNext}
            className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {currentContent.buttonText}
            {step < 3 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};