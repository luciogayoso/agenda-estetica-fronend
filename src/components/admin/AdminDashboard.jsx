import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/appointments`);
      const data = await response.json();

      if (data.status === 'success' || Array.isArray(data)) {
        // Soporta tanto res.json({ status: 'success', data: [...] }) como res.json([...])
        setAppointments(data.data || data);
      } else {
        setError('No se pudieron obtener los turnos');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Carga inicial
    fetchAppointments();

    // 2. Auto-actualización automática cada 5 segundos
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 5000);

    return () => clearInterval(interval);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', itemsCenter: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>📋 Panel de Gestión de Turnos</h2>
          {isRefreshing && <span style={{ fontSize: '12px', color: '#666' }}>🔄 Actualizando...</span>}
        </div>

        <button 
          onClick={() => fetchAppointments(false)}
          disabled={isRefreshing}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            background: isRefreshing ? '#666' : '#333', 
            color: '#fff', 
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔄 {isRefreshing ? 'Cargando...' : 'Actualizar Ahora'}
        </button>
      </div>

      {loading && <p>Cargando turnos desde Supabase...</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

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
                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{item.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.client_name}</td>
                <td style={{ padding: '12px' }}>
                  {item.client_phone ? (
                    <a 
                      href={`https://wa.me/${item.client_phone.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#25D366', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      💬 {item.client_phone}
                    </a>
                  ) : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  {item.services?.name || item.service_name || `Servicio #${item.service_id}`}
                </td>
                <td style={{ padding: '12px' }}>{formatDate(item.appointment_date)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block',
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