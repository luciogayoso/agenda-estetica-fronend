import { useState } from "react";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";

const SERVICES = [
  { id: 1, name: "Limpieza Facial Profunda", duration: "45 min", price: "$25.000" },
  { id: 2, name: "Masaje Descontracturante", duration: "60 min", price: "$30.000" },
  { id: 3, name: "Perfilado de Cejas + Henna", duration: "30 min", price: "$15.000" },
];

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "" });

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-sm border border-rose-100">
      {/* Pasos */}
      <div className="flex justify-between mb-8 border-b border-slate-100 pb-4 text-xs font-semibold text-rose-500">
        <span className={step >= 1 ? "opacity-100" : "opacity-30"}>1. Servicio</span>
        <span className={step >= 2 ? "opacity-100" : "opacity-30"}>2. Fecha y Hora</span>
        <span className={step >= 3 ? "opacity-100" : "opacity-30"}>3. Confirmación</span>
      </div>

      {/* Paso 1: Selección Servicio */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Elige un tratamiento</h2>
          <div className="grid gap-3">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s); setStep(2); }}
                className="p-4 border border-slate-200 rounded-xl hover:border-rose-400 text-left transition-all hover:bg-rose-50/30 flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.duration}</p>
                </div>
                <span className="font-bold text-rose-500 text-sm">{s.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: Fecha y Hora */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Selecciona fecha y horario</h2>
          <div className="flex flex-col gap-3">
            <input
              type="date"
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
            />
            <div className="grid grid-cols-3 gap-2">
              {["10:00", "14:00", "16:30"].map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                    selectedTime === time ? "bg-rose-500 text-white border-rose-500" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {time} hs
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:underline">Volver</button>
            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
              className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Datos y Confirmación */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Completa tus datos</h2>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
          />
          <input
            type="tel"
            placeholder="Teléfono (WhatsApp)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
          />
          <button
            onClick={() => setStep(4)}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors cursor-pointer"
          >
            Confirmar Reserva
          </button>
        </div>
      )}

      {/* Exito */}
      {step === 4 && (
        <div className="text-center py-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">¡Turno Confirmado!</h2>
          <p className="text-xs text-slate-500">Te enviamos los detalles por WhatsApp a {formData.phone}.</p>
          <button onClick={() => setStep(1)} className="mt-4 text-xs font-bold text-rose-500 hover:underline">
            Reservar otro turno
          </button>
        </div>
      )}
    </div>
  );
}


