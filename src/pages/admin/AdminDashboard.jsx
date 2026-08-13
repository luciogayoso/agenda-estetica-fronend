import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, RefreshCw, MessageCircle } from 'lucide-react';
import ScheduleManager from './ScheduleManager';
import ServicesManager from './ServicesManager';
import CalendarView from './CalendarView';

const API_BASE_URL = 'http://localhost:3000';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener turnos reales desde Supabase a través del Backend
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`);
      const data = await res.json();
      if (data.status === 'success') {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos del Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 1. Obtener la fecha de hoy en formato YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // 2. Filtrar únicamente los turnos del día de HOY
  const todayAppointments = appointments.filter((app) => {
    if (!app.appointment_date) return false;
    const rawDate = String(app.appointment_date).replace(' ', 'T');
    return rawDate.startsWith(todayStr);
  });

  // 3. Cálculos automáticos para las Tarjetas (Métricas Reales)
  const totalTurnosHoy = todayAppointments.length;
  
  // Clientes únicos acumulados en el sistema
  const totalClientesActivos = new Set(appointments.map(a => a.client_phone || a.client_name)).size;

  // Formateador de moneda ARS
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  // Extraer la hora limpia desde el string de fecha ISO
  const extractTime = (dateStr) => {
    if (!dateStr) return '--:--';
    const raw = String(dateStr).replace(' ', 'T');
    const parts = raw.split('T');
    return parts[1] ? parts[1].slice(0, 5) : '--:--';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
        
        <button 
          onClick={fetchAppointments}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-[#AB0F66] transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'agenda', label: 'Agenda del Día' },
          { id: 'calendario', label: 'Calendario' },
          { id: 'servicios', label: 'Servicios y Precios' },
          { id: 'bloqueos', label: 'Bloqueos y Festivos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#AB0F66] text-white shadow-md shadow-rose-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido Condicional */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          
          {/* Métricas e Indicadores en Tiempo Real */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Turnos de Hoy */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Calendar className="w-6 h-6 text-[#AB0F66]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Turnos Hoy</p>
                <p className="text-lg font-bold text-slate-800">{totalTurnosHoy} Turnos</p>
              </div>
            </div>

            {/* Card 2: Clientes Únicos */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Clientes Registrados</p>
                <p className="text-lg font-bold text-slate-800">{totalClientesActivos}</p>
              </div>
            </div>

            {/* Card 3: Reservas Totales */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Total Histórico</p>
                <p className="text-lg font-bold text-slate-800">{appointments.length} Reservas</p>
              </div>
            </div>
          </div>

          {/* Tabla/Lista de Agenda del Día */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800">
              Agenda de Hoy ({new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })})
            </h2>

            {loading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Cargando turnos de hoy...</p>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-400">No hay turnos agendados para el día de hoy.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayAppointments.map((app) => (
                  <div key={app.id} className="py-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#AB0F66] flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3" /> {extractTime(app.appointment_date)}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{app.client_name}</p>
                        <p className="text-slate-400">{app.service_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Botón rápido para ir a WhatsApp */}
                      {app.client_phone && (
                        <a
                          href={`https://wa.me/${app.client_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 p-1.5 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        app.status === 'confirmed' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {app.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pago Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calendario' && <CalendarView />}
      {activeTab === 'servicios' && <ServicesManager />}
      {activeTab === 'bloqueos' && <ScheduleManager />}
    </div>
  );
}