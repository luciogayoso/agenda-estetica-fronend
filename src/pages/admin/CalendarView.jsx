import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Clock, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function CalendarView() {
  // Fecha actual seleccionada (formato YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener turnos reales desde la base de datos
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`);
      const data = await res.json();
      if (data.status === 'success') {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar turnos del calendario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Navegar días (+1 o -1)
  const handleDateChange = (days) => {
    const current = new Date(`${selectedDate}T00:00:00`);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Formatear texto de la fecha
  const formattedHeaderDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 w-full">
      {/* Header del Calendario */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-2xl border border-rose-100 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#AB0F66]" />
          <h2 className="font-bold text-slate-800 text-sm">Vista de Turnos del Día</h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button 
            onClick={() => handleDateChange(-1)} 
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700 capitalize">{formattedHeaderDate}</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="opacity-0 w-4 h-4 -ml-6 cursor-pointer"
            />
          </div>
          
          <button 
            onClick={() => handleDateChange(1)} 
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          <button 
            onClick={fetchAppointments}
            className="ml-2 p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Franja Horaria Visual */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-3">
        {loading ? (
          <p className="text-center text-xs text-slate-400 py-8">Cargando agenda de Supabase...</p>
        ) : (
          ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((hour) => {
            
            // Filtrar todos los turnos correspondientes a este día y hora
            const hourMatches = appointments.filter((app) => {
              if (!app.appointment_date) return false;

              // Parsear la fecha del turno normalizando separadores (T o espacios)
              const rawDateStr = String(app.appointment_date).replace(' ', 'T');
              const [appDate, appTime] = rawDateStr.split('T');

              const isSameDate = appDate === selectedDate;
              const isSameHour = appTime && appTime.startsWith(hour.slice(0, 2));

              return isSameDate && isSameHour;
            });

            return (
              <div key={hour} className="flex items-start gap-4 py-2 border-b border-slate-50 text-xs">
                <span className="w-12 text-slate-400 font-mono font-bold flex items-center gap-1 pt-2">
                  <Clock className="w-3 h-3 text-slate-300" /> {hour}
                </span>

                <div className="flex-1 space-y-2">
                  {hourMatches.length > 0 ? (
                    hourMatches.map((match) => (
                      <div 
                        key={match.id}
                        className={`p-2.5 rounded-xl border flex justify-between items-center font-medium ${
                          match.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <div>
                          <p className="font-bold flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {match.client_name}
                          </p>
                          <p className="text-[11px] opacity-80">{match.service_name}</p>
                        </div>

                        <span 
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            match.status === 'confirmed' 
                              ? 'bg-emerald-200 text-emerald-900' 
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {match.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pago Pendiente'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-9 border border-dashed border-slate-200 rounded-xl flex items-center px-3 text-slate-300 text-[11px]">
                      Disponible
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}