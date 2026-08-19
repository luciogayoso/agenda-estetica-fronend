import React, { useState, useEffect } from 'react';
import { 
  Clock, User, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle, 
  CreditCard, Loader2, AlertCircle, Calendar, Search, CalendarDays, LogOut 
} from 'lucide-react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parseando JWT:', e);
    return null;
  }
}

export default function BookingWizard() {
  const [activeTab, setActiveTab] = useState('reserve');

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('google_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Mantener actualizado el nombre cuando se inicia sesión
  useEffect(() => {
    if (user?.name && !clientName) {
      setClientName(user.name);
    }
  }, [user]);

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = parseJwt(credentialResponse.credential);
      if (!decoded) return;

      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub
      };
      setUser(userData);
      localStorage.setItem('google_user', JSON.stringify(userData));
      setClientName(userData.name);
    } catch (error) {
      console.error('Error al decodificar token de Google:', error);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('google_user');
    setAppointments([]);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/services`);
        const result = await response.json();
        const rawList = Array.isArray(result) ? result : (result.data || []);
        const activeServices = rawList.filter(s => s.is_active !== false && s.active !== false);
        setServices(activeServices);
      } catch (err) {
        console.error('Error al cargar la lista de servicios:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (activeTab === 'my_appointments' && user?.email) {
      fetchUserAppointments(user.email);
    }
  }, [activeTab, user]);

  const fetchUserAppointments = async (email) => {
    setLoadingSearch(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/client/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setAppointments(data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error al consultar turnos:', err);
      setAppointments([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && selectedService) setStep(2);
    else if (step === 2 && appointmentDate && appointmentTime) setStep(3);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!user) return; // Bloqueo de seguridad si no hay usuario
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/appointments/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_phone: clientPhone,
          client_email: user?.email || '',
          service_id: selectedService.id,
          appointment_date: `${appointmentDate}T${appointmentTime}:00`
        })
      });

      const data = await response.json();

      if (data.status === 'success' && data.init_point) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setPaymentUrl(data.init_point);
        setStep(4);
        setLoading(false);

        window.location.href = data.init_point;
      } else {
        alert(data.message || 'Hubo un inconveniente al procesar la reserva.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al intentar realizar la reserva:', err);
      alert('Error de conexión con el servidor. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const getWhatsAppUrl = () => {
    const cleanPhone = clientPhone.replace(/\D/g, '');
    const message = `✨ *¡Hola ${clientName}! Tu turno en Lumière Studio está pre-reservado.* ✨\n\n` +
      `📌 *Servicio:* ${selectedService?.name}\n` +
      `📅 *Fecha:* ${appointmentDate}\n` +
      `⏰ *Hora:* ${appointmentTime} hs\n\n` +
      `Procedo a abonar la seña para confirmar mi turno.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl shadow-rose-100/60 border border-rose-100 p-6 md:p-10 transition-all my-6">
      
      {/* Header del Usuario / Perfil de Google */}
      {user && (
        <div className="flex items-center justify-between bg-rose-50/80 p-3 px-4 rounded-2xl mb-6 border border-rose-100">
          <div className="flex items-center gap-3">
            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border border-rose-200" />
            <div>
              <p className="text-xs font-semibold text-gray-800">{user.name}</p>
              <p className="text-[11px] text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-100/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pestañas de Navegación Principal */}
      <div className="flex bg-rose-50/60 p-1.5 rounded-2xl mb-8 border border-rose-100">
        <button
          onClick={() => setActiveTab('reserve')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reserve'
              ? 'bg-white text-[#AB0F66] shadow-sm'
              : 'text-slate-500 hover:text-[#AB0F66]'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Agendar Turno
        </button>
        <button
          onClick={() => setActiveTab('my_appointments')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'my_appointments'
              ? 'bg-white text-[#AB0F66] shadow-sm'
              : 'text-slate-500 hover:text-[#AB0F66]'
          }`}
        >
          <Search className="w-4 h-4" /> Mis Turnos
        </button>
      </div>

      {/* VISTA 1: FLUJO DE RESERVA */}
      {activeTab === 'reserve' && (
        <>
          {step < 4 && (
            <div className="flex justify-between items-center mb-8 border-b border-rose-100 pb-4">
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? 'text-[#AB0F66]' : 'text-gray-300'}`}>
                <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">1</span> Servicio
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= 2 ? 'text-[#AB0F66]' : 'text-gray-300'}`}>
                <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">2</span> Fecha y Hora
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= 3 ? 'text-[#AB0F66]' : 'text-gray-300'}`}>
                <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">3</span> Confirmar
              </div>
            </div>
          )}

          {/* Paso 1: Servicios */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gray-800 font-semibold mb-1">Elige tu experiencia</h2>
              <p className="text-sm text-gray-500 mb-6">Selecciona el tratamiento que deseas agendar hoy.</p>

              {loadingServices ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-rose-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium text-gray-500">Cargando catálogo...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                  <p className="text-sm font-medium">No hay servicios disponibles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                        selectedService?.id === s.id
                          ? 'border-rose-400 bg-rose-50/40 shadow-sm'
                          : 'border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{s.icon || '✨'}</span>
                        <div>
                          <h3 className="font-medium text-gray-800">{s.name}</h3>
                          {s.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.description}</p>}
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {s.duration_minutes || s.duration || 30} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-lg font-bold text-rose-950">${Number(s.price || 0).toLocaleString('es-AR')}</span>
                        <p className="text-xs text-rose-500 font-medium">Seña: ${Number(s.deposit_amount || s.deposit || 0).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={!selectedService || loadingServices}
                onClick={handleNextStep}
                className="w-full py-4 bg-[#AB0F66] hover:bg-[#8F0C54] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-2xl shadow-lg shadow-rose-200/50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Paso 2: Fecha y Hora */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-gray-800 font-semibold">Reserva tu Horario</h2>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Especialista</label>
                <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Sofía Valentina</p>
                    <p className="text-xs text-gray-400">Master Lash & Brow Artist</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hora</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium cursor-pointer"
                >
                  Volver
                </button>
                <button
                  disabled={!appointmentDate || !appointmentTime}
                  onClick={handleNextStep}
                  className="w-2/3 py-4 bg-[#AB0F66] hover:bg-[#8F0C54] disabled:bg-gray-200 text-white font-medium rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Identificación (Google) y Datos de Contacto */}
          {step === 3 && (
            <div className="space-y-6">
              {!user ? (
                /* Muestra el botón de inicio de sesión si el cliente no está autenticado */
                <div className="text-center py-6 space-y-5 bg-rose-50/40 p-6 rounded-2xl border border-rose-100">
                  <div className="w-12 h-12 bg-rose-100 text-[#AB0F66] rounded-full flex items-center justify-center mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-gray-800 mb-1">Inicia sesión para continuar</h2>
                    <p className="text-xs text-gray-500">
                      Inicia sesión con Google para asociar tu turno a tu cuenta.
                    </p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.error('Error de autenticación con Google')}
                      shape="pill"
                      theme="outline"
                      locale="es_AR"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium cursor-pointer text-xs"
                  >
                    Volver a elegir fecha
                  </button>
                </div>
              ) : (
                /* Muestra el formulario si ya está logueado */
                <form onSubmit={handleReserve} className="space-y-6">
                  <h2 className="font-serif text-2xl text-gray-800 font-semibold">Tus Datos de Contacto</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. María García"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 1112345678"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Servicio:</span>
                      <span className="font-medium text-gray-800">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Fecha y Hora:</span>
                      <span className="font-medium text-gray-800">{appointmentDate} a las {appointmentTime} hs</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold border-t border-rose-200 pt-2 text-base">
                      <span>Monto Seña a pagar:</span>
                      <span>${Number(selectedService?.deposit_amount || selectedService?.deposit || 0).toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium cursor-pointer"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Paso 4: Confirmación y Pago */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-gray-800 font-semibold">¡Turno Pre-Reservado!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Hola <span className="font-semibold text-gray-700">{clientName}</span>, completa el pago de la seña para finalizar.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={paymentUrl}
                  target="_self"
                  className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-2xl shadow-lg shadow-sky-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" /> Pagar Seña con Mercado Pago
                </a>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" /> Enviar Comprobante por WhatsApp
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* VISTA 2: MIS TURNOS CON LOGIN DE GOOGLE */}
      {activeTab === 'my_appointments' && (
        <div className="space-y-6">
          {!user ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-rose-100 text-[#AB0F66] rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Consulta tus Reservas</h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Para ver tus turnos agendados y su estado de pago, inicia sesión con tu cuenta de Google.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.error('Error de autenticación con Google')}
                  shape="pill"
                  theme="outline"
                  locale="es_AR"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-gray-800">Tus Reservas</h2>
                <button
                  onClick={() => fetchUserAppointments(user.email)}
                  className="text-xs font-semibold text-[#AB0F66] hover:underline cursor-pointer"
                >
                  Actualizar
                </button>
              </div>

              {loadingSearch ? (
                <div className="flex flex-col items-center justify-center py-10 text-rose-500 gap-2">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <p className="text-xs text-gray-500">Buscando tus turnos...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-600 text-sm font-medium">No tienes reservas registradas.</p>
                  <p className="text-xs text-gray-400">Las reservas vinculadas a {user.email} aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((item) => {
                    const isConfirmed = item.status === 'confirmed' || item.status === 'approved' || item.status === 'pagado';
                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-2xl border flex flex-wrap justify-between items-center transition-all gap-3 ${
                          isConfirmed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-800">{item.service_name || 'Tratamiento Estético'}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#AB0F66]" /> {new Date(item.appointment_date).toLocaleDateString('es-AR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#AB0F66]" /> {new Date(item.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                            </span>
                          </div>
                        </div>

                        <div>
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" /> Pendiente de Pago
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}