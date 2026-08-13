import React, { useState } from 'react';
import { CalendarX, Clock, Plus, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScheduleManager() {
  // Días completos bloqueados
  const [blockedDates, setBlockedDates] = useState([
    { id: 1, date: '2026-12-25', reason: 'Navidad' },
    { id: 2, date: '2026-01-01', reason: 'Año Nuevo' }
  ]);

  // Franjas horarias bloqueadas
  const [blockedSlots, setBlockedSlots] = useState([
    { id: 1, day: 'Lunes', startTime: '13:00', endTime: '14:00', reason: 'Almuerzo' }
  ]);

  // Estado para el formulario de Días
  const [newDate, setNewDate] = useState('');
  const [dateReason, setDateReason] = useState('');

  // Estado para el formulario de Franjas Horarias
  const [slotDay, setSlotDay] = useState('Lunes');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotReason, setSlotReason] = useState('');

  // Handlers para Días
  const handleAddBlockedDate = (e) => {
  e.preventDefault();
  if (!newDate) return;
  setBlockedDates([
    ...blockedDates,
    { id: Date.now(), date: newDate, reason: dateReason || 'Día Bloqueado' }
  ]);
  setNewDate('');
  setDateReason('');
  toast.success('Día bloqueado con éxito', {
    iconTheme: { primary: '#AB0F66', secondary: '#fff' }
  });
};

  const handleDeleteDate = (id) => {
    setBlockedDates(blockedDates.filter((item) => item.id !== id));
  };

  // Handlers para Franjas Horarias
  const handleAddBlockedSlot = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) return;
    setBlockedSlots([
      ...blockedSlots,
      {
        id: Date.now(),
        day: slotDay,
        startTime,
        endTime,
        reason: slotReason || 'Pausa Programada'
      }
    ]);
    setStartTime('');
    setEndTime('');
    setSlotReason('');
  };

  const handleDeleteSlot = (id) => {
    setBlockedSlots(blockedSlots.filter((slot) => slot.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 text-[#AB0F66] rounded-xl">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bloqueo de Días y Horarios</h1>
          <p className="text-xs text-slate-400">Gestiona festivos, vacaciones y pausas del personal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloque 1: Bloquear Día Completo */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CalendarX className="w-4 h-4 text-[#AB0F66]" /> Bloquear Día Festivo / Franco
          </h2>

          <form onSubmit={handleAddBlockedDate} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold">Seleccionar Fecha</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 focus:outline-none focus:border-[#AB0F66]"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold">Motivo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Feriado, Capacitación..."
                value={dateReason}
                onChange={(e) => setDateReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 focus:outline-none focus:border-[#AB0F66]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#AB0F66] hover:bg-[#8F0C54] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Bloqueo de Día
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-500">Días Inhabilitados</span>
            {blockedDates.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 text-xs">
                <div>
                  <p className="font-bold text-slate-700">{item.date}</p>
                  <p className="text-[10px] text-slate-400">{item.reason}</p>
                </div>
                <button
                  onClick={() => handleDeleteDate(item.id)}
                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bloque 2: Bloquear Franjas Horarias */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#AB0F66]" /> Bloquear Franja Horaria
          </h2>

          <form onSubmit={handleAddBlockedSlot} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold">Día de la semana</label>
              <select
                value={slotDay}
                onChange={(e) => setSlotDay(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 focus:outline-none focus:border-[#AB0F66]"
              >
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 font-semibold">Hora Desde</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 focus:outline-none focus:border-[#AB0F66]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Hora Hasta</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 focus:outline-none focus:border-[#AB0F66]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold">Motivo</label>
              <input
                type="text"
                placeholder="Ej. Almuerzo, Limpieza de cabina..."
                value={slotReason}
                onChange={(e) => setSlotReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 focus:outline-none focus:border-[#AB0F66]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#AB0F66] hover:bg-[#8F0C54] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Franja Bloqueada
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-500">Horarios Inhabilitados</span>
            {blockedSlots.map((slot) => (
              <div key={slot.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-[#AB0F66]">{slot.day}: </span>
                  <span className="font-medium text-slate-700">{slot.startTime} - {slot.endTime}</span>
                  <p className="text-[10px] text-slate-400">{slot.reason}</p>
                </div>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}