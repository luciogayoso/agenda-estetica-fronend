import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, CreditCard, ExternalLink, UserCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function MisTurnos({ currentUser, onGoogleLoginSuccess }) {
  const [userEmail, setUserEmail] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const googleBtnRef = useRef(null);

  // 1. Detectar si ya hay un usuario logueado vía props o localStorage
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

  // 2. Inicializar de forma limpia el botón oficial de Google Sign-In cuando no hay sesión
  useEffect(() => {
    if (!userEmail && window.google && googleBtnRef.current) {
      googleBtnRef.current.innerHTML = ''; // Limpia renderizados previos para evitar duplicación

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 250
      });
    }
  }, [userEmail]);

  // Callback ejecutado tras autenticarse con Google
  const handleGoogleResponse = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const profile = JSON.parse(jsonPayload);
      console.log('✅ Sesión iniciada con Google:', profile);

      localStorage.setItem('user_profile', JSON.stringify(profile));
      setUserEmail(profile.email);

      if (onGoogleLoginSuccess) {
        onGoogleLoginSuccess(profile);
      }

      fetchAppointments(profile.email);
    } catch (error) {
      console.error('Error procesando credencial de Google:', error);
    }
  };

  // 3. Consultar las reservas asociadas a la cuenta en Supabase
  const fetchAppointments = async (emailQuery) => {
    if (!emailQuery) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/appointments/client/${encodeURIComponent(emailQuery.trim().toLowerCase())}`);
      const data = await res.json();

      if (data.status === 'success' || Array.isArray(data.data)) {
        const rawList = Array.isArray(data.data) ? data.data : (data.appointments || []);

        const userTurnos = rawList.filter((item) => {
          const itemEmail = (item.client_email || item.email || '').toLowerCase();
          return itemEmail === emailQuery.toLowerCase();
        });

        setAppointments(userTurnos);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error al consultar turnos:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // 4. Generar o redirigir al checkout de Mercado Pago para pagar la seña
  const handlePayDeposit = async (appointment) => {
    // Garantizar obtención del ID único
    const appointmentId = appointment.id || appointment._id;

    if (!appointmentId) {
      alert("Error: No se encontró el identificador del turno.");
      return;
    }

    // Abrir link directo si ya estaba generado
    const directUrl = appointment.init_point || appointment.payment_url || appointment.sandbox_init_point;
    if (directUrl) {
      window.open(directUrl, '_blank');
      return;
    }

    // Solicitar nuevo enlace de pago al backend
    setPayingId(appointmentId);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok && data.status === 'success' && data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        console.error("Error del servidor:", data);
        alert(data.message || 'No se pudo generar el enlace de pago.');
      }
    } catch (err) {
      console.error('Error de red al procesar pago:', err);
      alert('Error de conexión al generar el pago.');
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
            Iniciá sesión con tu cuenta de Google para acceder a tus citas.
          </p>
        )}
      </div>

      {/* Si NO hay usuario autenticado */}
      {!userEmail && (
        <div className="flex flex-col items-center justify-center my-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium mb-4">
            Para proteger tu información, iniciá sesión con tu cuenta de Google:
          </p>

          {/* Contenedor del Botón Oficial Google */}
          <div ref={googleBtnRef} className="min-h-[44px] flex justify-center items-center"></div>
        </div>
      )}

      {/* Estado de Carga */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-[#AB0F66] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Buscando tus citas asociadas...</p>
        </div>
      )}

      {/* Listado de Turnos */}
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
              const appointmentId = item.id || item._id;
              const statusLower = (item.status || item.payment_status || '').toLowerCase();
              const isPaid = ['approved', 'pagado', 'paid', 'completed', 'confirmed', 'confirmado'].includes(statusLower);

              return (
                <div
                  key={appointmentId}
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
                          disabled={payingId === appointmentId}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md transition-all w-full sm:w-auto cursor-pointer disabled:opacity-50"
                        >
                          {payingId === appointmentId ? (
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