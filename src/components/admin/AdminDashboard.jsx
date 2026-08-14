import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'services'
  
  // Estados de Citas
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Estados de Servicios (CRUD)
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', deposit_amount: '', duration_minutes: 60, icon: '✨' });

  // --- Carga de Citas ---
  const fetchAppointments = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/appointments`);
      const data = await response.json();
      if (data.status === 'success' || Array.isArray(data)) {
        setAppointments(data.data || data);
      } else {
        setError('No se pudieron obtener los turnos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // --- Carga de Servicios desde Supabase ---
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await fetch(`${API_URL}/api/services`);
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    const interval = setInterval(() => fetchAppointments(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Operaciones CRUD de Servicios ---
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        setNewService({ name: '', description: '', price: '', deposit_amount: '', duration_minutes: 60, icon: '✨' });
        fetchServices();
      }
    } catch (err) {
      alert('Error al crear el servicio');
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  // --- Cambiar estado de Turno Manualmente ---
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAppointments(true);
    } catch (err) {
      alert('No se pudo actualizar el estado');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Navegación por pestañas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', pb: '10px' }}>
        <button 
          onClick={() => setActiveTab('appointments')}
          style={{ padding: '10px 20px', background: activeTab === 'appointments' ? '#AB0F66' : '#f0f0f0', color: activeTab === 'appointments' ? '#fff' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📋 Reservas / Turnos
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          style={{ padding: '10px 20px', background: activeTab === 'services' ? '#AB0F66' : '#f0f0f0', color: activeTab === 'services' ? '#fff' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ✨ Gestión de Servicios (CRUD)
        </button>
      </div>

      {/* PESTAÑA 1: TURNOS */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>📋 Panel de Gestión de Turnos</h2>
            <button onClick={() => fetchAppointments(false)} disabled={isRefreshing} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              🔄 {isRefreshing ? 'Cargando...' : 'Actualizar Ahora'}
            </button>
          </div>

          {loading && <p>Cargando turnos desde Supabase...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f4f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Cliente</th>
                  <th style={{ padding: '12px' }}>Servicio</th>
                  <th style={{ padding: '12px' }}>Fecha y Hora</th>
                  <th style={{ padding: '12px' }}>Estado</th>
                  <th style={{ padding: '12px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>#{item.id}</td>
                    <td style={{ padding: '12px' }}><strong>{item.client_name}</strong><br/><small>{item.client_phone}</small></td>
                    <td style={{ padding: '12px' }}>{item.services?.name || item.service_name || `Servicio #${item.service_id}`}</td>
                    <td style={{ padding: '12px' }}>{formatDate(item.appointment_date)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: item.status === 'confirmed' ? '#dcfce7' : '#fef3c7', color: item.status === 'confirmed' ? '#166534' : '#92400e' }}>
                        {item.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.status !== 'confirmed' && (
                        <button onClick={() => handleStatusChange(item.id, 'confirmed')} style={{ padding: '4px 8px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Marcar Pagado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PESTAÑA 2: CRUD DE SERVICIOS */}
      {activeTab === 'services' && (
        <div>
          <h2>✨ Cargar Nuevo Servicio para la Web</h2>
          <form onSubmit={handleCreateService} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <input type="text" placeholder="Nombre (ej. Limpieza Facial)" required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} style={{ padding: '8px' }} />
            <input type="text" placeholder="Icono Emoji (ej. 💆‍♀️)" value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})} style={{ padding: '8px' }} />
            <input type="number" placeholder="Precio Total ($)" required value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} style={{ padding: '8px' }} />
            <input type="number" placeholder="Monto Seña ($)" required value={newService.deposit_amount} onChange={e => setNewService({...newService, deposit_amount: e.target.value})} style={{ padding: '8px' }} />
            <input type="number" placeholder="Duración (Minutos)" value={newService.duration_minutes} onChange={e => setNewService({...newService, duration_minutes: e.target.value})} style={{ padding: '8px' }} />
            <input type="text" placeholder="Descripción breve" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} style={{ padding: '8px' }} />
            <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#AB0F66', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              ➕ Guardar Servicio en Supabase
            </button>
          </form>

          <h3>Servicios Activos Actualmente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', alignItems: 'center' }}>
                <div>
                  <strong>{s.icon} {s.name}</strong> - ${s.price} (Seña: ${s.deposit_amount})
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{s.description}</p>
                </div>
                <button onClick={() => handleDeleteService(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}