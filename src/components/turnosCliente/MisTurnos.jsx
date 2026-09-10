import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, CreditCard, ExternalLink, UserCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function MisTurnos({ currentUser, onGoogleLogin }) {
  const [userEmail, setUserEmail] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [payingId, setPayingId] = useState(null);

  // Detectar email de Google automáticamente al iniciar o cambiar sesión
  useEffect(() => {
    const storedUser = localStorage.getItem('user_profile');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    
    const activeEmail = currentUser?.email || parsedUser?.email;

    if (activeEmail) {
      setUserEmail(activeEmail);
      fetchAppointments(activeEmail);
    } else {
      setUserEmail('');
      setAppointments([]);
      setSearched(false);
    }
  }, [currentUser]);

  // Petición al backend filtrando únicamente por el email de la cuenta Google
  const fetchAppointments = async (emailQuery) => {
    if (!emailQuery) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/appointments/client/${encodeURIComponent(emailQuery.trim().toLowerCase())}`);
      const data = await res.json();

      if (data.status === 'success' || Array.isArray(data.data)) {
        const rawList = Array.isArray(data.data) ? data.data : (data.appointments || []);
        
        // Garantizar filtrado estricto por la dirección de Gmail activa
        const userTurnos = rawList.filter((item) => {
          const itemEmail = (item.client_email || item.email || '').toLowerCase();
          return itemEmail === emailQuery.toLowerCase();
        });

        setAppointments(userTurnos);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error al obtener los turnos:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Manejador para iniciar el pago de la seña si el link aún no estaba generado
  const handlePayDeposit = async (appointment) => {
    const directUrl = appointment.init_point || appointment.payment_url || appointment.sandbox_init_point;
    
    if (directUrl) {
      window.open(directUrl, '_blank');
      return;
    }

    // Si no existía link de pago previo, lo generamos dinámicamente mediante el endpoint `/pay`
    setPayingId(appointment.id);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointment.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.status === 'success' && data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        alert(data.message || 'No se pudo generar el enlace de pago.');
      }
    } catch (err) {
      console.error('Error al generar pago:', err);
      alert('Ocurrió un error al conectar con Mercado Pago.');
    } finally {
      setPayingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Fecha a confirmar';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-rose-100 my-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Mis Turnos Reservados</h2>
        
        {userEmail ? (
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-1.5 rounded-full text-xs font-medium mt-1">
            <UserCheck className="w-4 h-4 text-rose-600" />
            Conectado como: <strong>{userEmail}</strong>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Iniciá sesión con tu cuenta de Google para consultar tus citas reservadas.
          </p>
        )}
      </div>

      {/* Si NO hay usuario autenticado con Google */}
      {!userEmail && (
        <div className="flex flex-col items-center gap-4 my-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium">
            Para ver tus turnos, iniciá sesión de forma segura con Google:
          </p>

          <button
            onClick={onGoogleLogin}
            className="px-6 py-3.5 bg-white border border-gray-300 shadow-md hover:shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 cursor-pointer text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Iniciar sesión con Google
          </button>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-[#AB0F66] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Buscando tus citas asociadas...</p>
        </div>
      )}

      {/* Listado de turnos obtenidos */}
      {!loading && searched && userEmail && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">
                No tenés turnos activos o reservados con la cuenta <span className="font-semibold text-rose-600">{userEmail}</span>.
              </p>
            </div>
          ) : (
            appointments.map((item) => {
              const statusLower = (item.status || item.payment_status || '').toLowerCase();
              
              const isPaid = ['approved', 'pagado', 'paid', 'completed', 'confirmed', 'confirmado'].includes(statusLower);

              return (
                <div
                  key={item.id || item._id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    isPaid ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-base">
                      {item.service_name || item.service || 'Tratamiento Estético'}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#AB0F66]" /> 
                        {formatDate(item.appointment_date || item.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#AB0F66]" /> 
                        {formatTime(item.appointment_date || item.time)} hs
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Seña Pagada / Confirmado
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pendiente de Seña
                        </span>

                        <button
                          onClick={() => handlePayDeposit(item)}
                          disabled={payingId === item.id}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md transition-all w-full sm:w-auto cursor-pointer disabled:opacity-50"
                        >
                          {payingId === item.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando Pago...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" /> Pagar Seña con Mercado Pago <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                            </>
                          )}
                        </button>
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