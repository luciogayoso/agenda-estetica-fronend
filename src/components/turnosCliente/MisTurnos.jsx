import React, { useState } from 'react';
import { Search, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, CreditCard, ExternalLink } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function MisTurnos() {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/appointments/client/${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (data.status === 'success') {
        setAppointments(data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error al consultar turnos:', err);
      setAppointments([]);
    } fontally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-rose-100 my-8">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Mis Turnos</h2>
        <p className="text-sm text-gray-500">
          Ingresa tu número de teléfono o WhatsApp para consultar tus reservas y abonar señas pendientes.
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="tel"
          placeholder="Ej: 1112345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 bg-[#AB0F66] text-white font-medium rounded-xl hover:bg-[#8F0C54] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </button>
      </form>

      {/* Resultados */}
      {searched && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No encontramos turnos registrados con el teléfono <span className="font-semibold">{phone}</span>.</p>
            </div>
          ) : (
            appointments.map((item) => {
              // Verificación del estado de confirmación
              const isConfirmed = item.status === 'confirmed' || item.status === 'approved' || item.status === 'pagado';
              
              // Extraer link de Mercado Pago desde las posibles propiedades devueltas por la API
              const mpUrl = item.init_point || item.payment_url || item.sandbox_init_point;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    isConfirmed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  {/* Detalles del servicio */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-base">{item.service_name || 'Tratamiento Estético'}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#AB0F66]" /> 
                        {new Date(item.appointment_date).toLocaleDateString('es-AR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#AB0F66]" /> 
                        {new Date(item.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                      </span>
                    </div>
                  </div>

                  {/* Estado y Acción de Pago */}
                  <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pagado / Confirmado
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pendiente de Pago
                        </span>

                        {mpUrl && (
                          <a
                            href={mpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-all w-full sm:w-auto"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pagar Seña <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                          </a>
                        )}
                      </>
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