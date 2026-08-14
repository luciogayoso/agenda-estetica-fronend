import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// Agregamos fallback por si VITE_BACKEND_URL no está definido en las variables de entorno
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function ReservaExito() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const hasConfirmed = useRef(false); // Previene ejecuciones dobles en React 18 (StrictMode)

  // Mercado Pago envía 'collection_status' o 'status'
  const paymentStatus = searchParams.get('collection_status') || searchParams.get('status');
  
  // Buscar ID de turno por external_reference o por la query personalizada appointment_id
  const appointmentId = searchParams.get('external_reference') || searchParams.get('appointment_id');

  useEffect(() => {
    const confirmAppointment = async () => {
      // Previene ejecuciones dobles
      if (hasConfirmed.current) return;

      // Si el pago es aprobado o viene el ID del turno, llamamos al endpoint de respaldo
      if (appointmentId && (paymentStatus === 'approved' || !paymentStatus)) {
        hasConfirmed.current = true;
        try {
          const res = await fetch(`${API_URL}/api/appointments/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointment_id: appointmentId })
          });

          const data = await res.json();

          if (data.status === 'success') {
            console.log('✅ Confirmación de turno registrada en el backend:', data);
            setConfirmed(true);
          } else {
            console.warn('⚠️ El backend devolvió un estado no exitoso:', data);
          }
        } catch (error) {
          console.error('❌ Error al intentar confirmar el turno:', error);
        }
      } else {
        console.warn('ℹ️ No se detectó un pago aprobado o falta el ID de la reserva.');
      }

      setLoading(false);
    };

    confirmAppointment();
  }, [paymentStatus, appointmentId]);

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', fontFamily: 'sans-serif' }}>
      {loading ? (
        <div>
          <h2 style={{ color: '#444' }}>Procesando y confirmando tu reserva... ⏳</h2>
          <p style={{ color: '#888', fontSize: '14px' }}>Por favor, aguarda un instante.</p>
        </div>
      ) : (
        <div style={{ maxWidth: '500px', margin: '0 auto', background: '#f9f9f9', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {confirmed || paymentStatus === 'approved' ? (
            <>
              <h1 style={{ color: '#2e7d32', fontSize: '24px', marginBottom: '10px' }}>¡Reserva Confirmada Exitosamente! 🎉</h1>
              <p style={{ color: '#555', lineHeight: '1.5' }}>
                Tu pago ha sido recibido y tu turno quedó oficialmente registrado en nuestro sistema.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ color: '#d32f2f', fontSize: '24px', marginBottom: '10px' }}>Estado de la Reserva 📌</h1>
              <p style={{ color: '#555', lineHeight: '1.5' }}>
                Tu solicitud fue recibida. Si realizaste el pago, el turno cambiará automáticamente a confirmado en breve.
              </p>
            </>
          )}

          <div style={{ marginTop: '30px' }}>
            <Link 
              to="/" 
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#AB0F66',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
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