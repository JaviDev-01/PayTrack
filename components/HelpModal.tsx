import React from "react";
import {
  X,
  HelpCircle,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQItem = ({
  question,
  answer,
  icon: Icon,
}: {
  question: string;
  answer: string;
  icon: any;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400 group-hover:text-gray-600"}`}
          >
            <Icon size={18} />
          </div>
          <span
            className={`text-sm font-bold transition-colors ${isOpen ? "text-indigo-900" : "text-gray-700"}`}
          >
            {question}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-gray-500 leading-relaxed pb-4 pl-12 pr-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 bg-white z-10 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Ayuda y Soporte
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Preguntas Frecuentes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <FAQItem
              icon={Calendar}
              question="¿Cómo funcionan los ciclos?"
              answer="Puedes configurar el día de inicio de tu nómina en Ajustes. La App mostrará tus ganancias desde ese día hasta el mismo día del mes siguiente. Si prefieres ver mes natural (1 al 30), selecciona 'Mes Actual' en la configuración."
            />
            <FAQItem
              icon={CheckCircle2}
              question="¿Cómo marco un festivo?"
              answer="Al añadir o editar una hora, activa el interruptor 'Festivo' (icono de destellos). La App aplicará automáticamente tu tarifa especial para festivos. Mencionar que los festivos no se aplican automaticamente ya que la app (por ahora) no tiene aceso a 
              los diferentes calendarios de festivos de las comunidades autonomas ni a los festivos nacionales. Por lo que deberas marcar los festivos manualmente."
            />
            <FAQItem
              icon={DollarSign}
              question="¿Qué es el IRPF?"
              answer="Es el Impuesto sobre la Renta español. Puedes configurar tu porcentaje de retención en Ajustes para ver cuánto cobrarás realmente (Neto) después de impuestos. Recuerda que este cálculo es orientativo y no sustituye el asesoramiento de un profesional.
              para saber con exactitud cuanto debes retener en tu nómina debes consultar con un asesor fiscal o con la Agencia Tributaria."
            />
            <FAQItem
              icon={FileSpreadsheet}
              question="¿Cómo exportar mis datos?"
              answer="Ve a la pestaña de Ajustes y pulsa el botón verde de Excel. Se generará un archivo .xlsx que puedes compartir por WhatsApp, Email o guardar en tu móvil. Recordamos que la funcionalidad de exportar a Excel está en fase beta y puede contener errores. Además 
              al tratarse de una versión beta la prueba realizada ha sido comprobada en ordenadores por lo que no se puede garantizar su correcto funcionamiento en todos los dispositivos móviles."
            />
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-1">Versión de la App</p>
            <p className="text-sm font-bold text-gray-900">v1.6.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
