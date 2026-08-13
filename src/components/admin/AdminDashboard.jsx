import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:3000'; // Ajusta la URL si usas otro puerto

export function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`);
      const data = await response.json();
      if (data.status === 'success') {
        setAppointments(data.data);
      } else {
        setError('No se pudieron obtener los turnos');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📋 Panel de Gestión de Turnos</h2>
        <button 
          onClick={fetchAppointments}
          style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {loading && <p>Cargando turnos desde Supabase...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p>No hay reservas registradas todavía.</p>
      )}

      {!loading && appointments.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f4f4f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Cliente</th>
              <th style={{ padding: '12px' }}>WhatsApp</th>
              <th style={{ padding: '12px' }}>Servicio</th>
              <th style={{ padding: '12px' }}>Fecha y Hora</th>
              <th style={{ padding: '12px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>#{item.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.client_name}</td>
                <td style={{ padding: '12px' }}>
                  <a 
                    href={`https://wa.me/${item.client_phone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#25D366', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    💬 {item.client_phone}
                  </a>
                </td>
                <td style={{ padding: '12px' }}>{item.service_name}</td>
                <td style={{ padding: '12px' }}>{formatDate(item.appointment_date)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: item.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                    color: item.status === 'confirmed' ? '#166534' : '#92400e'
                  }}>
                    {item.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pago Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}