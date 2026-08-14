import React, { useState } from 'react';
import { Search, Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function MisTurnos() {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/appointments/client/${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (data.status === 'success') {
        setAppointments(data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error al consultar turnos:', err);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-rose-100 my-8">
      <h2 className="font-serif text-2xl font-bold text-gray-800 text-center mb-2">Mis Turnos y Servicios</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Ingresa tu número de WhatsApp para consultar el estado de tus reservas.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="tel"
          placeholder="Ej: 1112345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 bg-[#AB0F66] text-white font-medium rounded-xl hover:bg-[#8F0C54] transition-all flex items-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </button>
      </form>

      {searched && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No encontramos turnos registrados con ese teléfono.</p>
            </div>
          ) : (
            appointments.map((item) => {
              const isConfirmed = item.status === 'confirmed' || item.status === 'approved' || item.status === 'pagado';
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border flex justify-between items-center transition-all ${
                    isConfirmed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800">{item.service_name || 'Tratamiento Estético'}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(item.appointment_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(item.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</span>
                    </div>
                  </div>

                  <div>
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pagado / Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Pendiente de Pago
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}