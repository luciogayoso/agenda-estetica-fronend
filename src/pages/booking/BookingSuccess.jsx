import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, Download, Share2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();

  // Obtenemos parámetros que te envía Mercado Pago por URL (opcional)
  const paymentId = searchParams.get('payment_id') || 'MP-849201';

  React.useEffect(() => {
    // Dispara papelitos de celebración al cargar la pantalla
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  }, []);

  const handleShareWhatsApp = () => {
    const message = `¡Hola! Confirmé mi turno en Lumière Studio. ID Pago: ${paymentId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-rose-100/60 border border-rose-100 p-6 md:p-8 text-center my-auto">
      {/* Icono Éxito */}
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="font-serif text-2xl font-bold text-slate-800">¡Reserva Confirmada!</h1>
      <p className="text-xs text-slate-400 mt-1 mb-6">
        Hemos enviado el comprobante a tu correo y guardado tu turno.
      </p>

      {/* Ticket de la Reserva */}
      <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 text-left space-y-3 mb-6">
        <div className="flex justify-between items-center border-b border-rose-100 pb-2">
          <span className="text-xs text-slate-400 font-medium">N° de Comprobante</span>
          <span className="text-xs font-mono font-bold text-rose-700">#{paymentId}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-700">
          <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-medium">Fecha: 15 de Octubre, 2026</span>
        </div>

        <div className="flex items-center gap-3 text-slate-700">
          <Clock className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-medium">Hora: 14:30 hs</span>
        </div>

        <div className="flex items-center gap-3 text-slate-700">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-medium">Lumière Studio - Av. Principal 123</span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="space-y-3">
        <button
          onClick={handleShareWhatsApp}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-100 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Compartir por WhatsApp
        </button>

        <Link
          to="/"
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
}