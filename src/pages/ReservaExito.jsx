import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// Agregamos fallback por si VITE_BACKEND_URL no está en Vercel
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function ReservaExito() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const hasConfirmed = useRef(false); // Previene ejecuciones dobles en React 18

  // Mercado Pago envía 'collection_status' o 'status'
  const paymentStatus = searchParams.get('collection_status') || searchParams.get('status');
  
  // Buscar ID de turno por external_reference o por la query personalizada appointment_id
  const appointmentId = searchParams.get('external_reference') || searchParams.get('appointment_id');

  useEffect(() => {
    const confirmAppointment = async () => {
      // Previene que React StrictMode dispare la llamada 2 veces
      if (hasConfirmed.current) return;

      if (paymentStatus === 'approved' && appointmentId) {
        hasConfirmed.current = true;
        try {
          const res = await fetch(`${API_URL}/api/appointments/confirm-manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointment_id: appointmentId })
          });
          const data = await res.json();
          console.log('✅ Confirmación manual completada:', data);
        } catch (error) {
          console.error('❌ Error confirmando el turno:', error);
        }
      }
      setLoading(false);
    };

    confirmAppointment();
  }, [paymentStatus, appointmentId]);

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', fontFamily: 'sans-serif' }}>
      {loading ? (
        <h2>Confirmando tu reserva... ⏳</h2>
      ) : (
        <div style={{ maxWidth: '500px', margin: '0 auto', background: '#f9f9f9', padding: '30px', borderRadius: '12px' }}>
          <h1 style={{ color: '#2e7d32' }}>¡Reserva Confirmada Exitosamente! 🎉</h1>
          <p>Tu pago ha sido procesado y tu turno quedó agendado en el sistema.</p>
          <div style={{ marginTop: '25px' }}>
            <Link 
              to="/" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#d81b60',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}