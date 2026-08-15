import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  // 1. Cargar la lista de servicios desde la Base de Datos
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/services`);
        const result = await response.json();

        // Soporta respuesta directa en Array o envuelta en { data: [...] }
        const rawList = Array.isArray(result) ? result : (result.data || []);
        
        // Filtrar servicios activos si el campo existe
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

  const handleNextStep = () => {
    if (step === 1 && selectedService) setStep(2);
    else if (step === 2 && appointmentDate && appointmentTime) setStep(3);
  };

  // 2. Procesar la reserva e integrar Mercado Pago
  const handleReserve = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/appointments/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_phone: clientPhone,
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

        // Redirección directa al checkout de Mercado Pago
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
    <main className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-rose-100/60 border border-rose-100 p-6 md:p-10 transition-all">
      {/* Barra de progreso */}
      {step < 4 && (
        <div className="flex justify-between items-center mb-8 border-b border-rose-100 pb-4">
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? 'text-rose-600' : 'text-gray-300'}`}>
            <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">1</span> Servicio
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 2 ? 'text-rose-600' : 'text-gray-300'}`}>
            <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">2</span> Fecha y Hora
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 3 ? 'text-rose-600' : 'text-gray-300'}`}>
            <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">3</span> Confirmar
          </div>
        </div>
      )}

      {/* Paso 1: Selección de Servicios Dinámicos desde la BD */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-gray-800 font-semibold mb-1">Elige tu experiencia</h2>
          <p className="text-sm text-gray-500 mb-6">Selecciona el tratamiento que deseas agendar hoy.</p>

          {loadingServices ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-rose-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Cargando catálogo de servicios...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 gap-2">
              <AlertCircle className="w-8 h-8 text-slate-400" />
              <p className="text-sm font-medium">No hay servicios disponibles en este momento.</p>
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
                      {s.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.description}</p>
                      )}
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
              className="w-2/3 py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 text-white font-medium rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Confirmación y Datos */}
      {step === 3 && (
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
                placeholder="Ej. +54 9 11 1234 5678"
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
              <span>Monto Seña para reservar:</span>
              <span>${Number(selectedService?.deposit_amount || selectedService?.deposit || 0).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Reserva protegida y garantizada por Mercado Pago
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando Reserva...
              </>
            ) : (
              'Confirmar Reserva'
            )}
          </button>
        </form>
      )}

      {/* Paso 4: Redirección manual / pantalla de respaldo */}
      {step === 4 && (
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-serif text-2xl text-gray-800 font-semibold">¡Turno Pre-Reservado!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Hola <span className="font-semibold text-gray-700">{clientName}</span>, completa el pago de la seña para finalizar la reserva.
            </p>
          </div>

          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-left text-sm space-y-1">
            <p><span className="text-gray-500">Servicio:</span> <strong>{selectedService?.name}</strong></p>
            <p><span className="text-gray-500">Fecha y hora:</span> <strong>{appointmentDate} a las {appointmentTime} hs</strong></p>
            <p><span className="text-gray-500">Monto seña:</span> <strong className="text-rose-700">${Number(selectedService?.deposit_amount || selectedService?.deposit || 0).toLocaleString('es-AR')}</strong></p>
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
    </main>
  );
}