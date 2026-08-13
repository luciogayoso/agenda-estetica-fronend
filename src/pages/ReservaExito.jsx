import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function ReservaExito() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Mercado Pago envía estos parámetros en la URL al volver
  const paymentStatus = searchParams.get('collection_status') || searchParams.get('status');
  const externalReference = searchParams.get('external_reference'); // Es el ID del turno

  useEffect(() => {
    const confirmAppointment = async () => {
      // Si el pago está aprobado y tenemos el ID del turno
      if (paymentStatus === 'approved' && externalReference) {
        try {
          await fetch(`${API_URL}/api/appointments/confirm-manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointment_id: externalReference })
          });
        } catch (error) {
          console.error('Error confirmando el turno:', error);
        }
      }
      setLoading(false);
    };

    confirmAppointment();
  }, [paymentStatus, externalReference]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {loading ? (
        <h2>Confirmando tu reserva... ⏳</h2>
      ) : (
        <>
          <h1>¡Reserva Confirmada Exitosamente! 🎉</h1>
          <p>Tu pago ha sido procesado y tu turno quedó agendado.</p>
          <Link to="/">Volver al Inicio</Link>
        </>
      )}
    </div>
  );
}