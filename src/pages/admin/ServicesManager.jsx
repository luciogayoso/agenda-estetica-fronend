import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Clock, DollarSign, Check, X, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://agenda-estetica-backend.onrender.com';

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [professionalsList, setProfessionalsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    deposit: '',
    selectedProfessionals: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resServices, resProfs] = await Promise.all([
        fetch(`${API_URL}/api/services`),
        fetch(`${API_URL}/api/professionals`)
      ]);

      const dataServices = await resServices.json();
      const dataProfs = await resProfs.json();

      if (dataServices.status === 'success') {
        setServices(dataServices.services);
      }
      if (dataProfs.status === 'success') {
        setProfessionalsList(dataProfs.professionals);
      }
    } catch (error) {
      toast.error('Error al obtener la información de servicios y profesionales');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProfessional = (profId) => {
    setFormData((prev) => {
      const exists = prev.selectedProfessionals.includes(profId);
      if (exists) {
        return {
          ...prev,
          selectedProfessionals: prev.selectedProfessionals.filter((id) => id !== profId)
        };
      } else {
        return {
          ...prev,
          selectedProfessionals: [...prev.selectedProfessionals, profId]
        };
      }
    });
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      deposit: service.deposit,
      selectedProfessionals: service.professionals ? service.professionals.map((p) => p.id) : []
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', duration: '', price: '', deposit: '', selectedProfessionals: [] });
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          duration: formData.duration,
          price: formData.price,
          deposit: formData.deposit,
          professionalIds: formData.selectedProfessionals
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Servicio actualizado correctamente', {
          iconTheme: { primary: '#AB0F66', secondary: '#fff' }
        });
        setEditingId(null);
        setFormData({ name: '', duration: '', price: '', deposit: '', selectedProfessionals: [] });
        fetchData();
      } else {
        toast.error('No se pudo actualizar el servicio');
      }
    } catch (error) {
      toast.error('Error de conexión al actualizar');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        toast.error('Servicio eliminado');
        fetchData();
      }
    } catch (error) {
      toast.error('Error al eliminar el servicio');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const res = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          duration: formData.duration,
          price: formData.price,
          deposit: formData.deposit,
          professionalIds: formData.selectedProfessionals
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        toast.success('¡Servicio agregado con éxito!', {
          iconTheme: { primary: '#AB0F66', secondary: '#fff' }
        });
        setFormData({ name: '', duration: '', price: '', deposit: '', selectedProfessionals: [] });
        fetchData();
      } else {
        toast.error('Error al crear el servicio');
      }
    } catch (error) {
      toast.error('Error de conexión al guardar el servicio');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#AB0F66]" />
        <p className="text-xs text-slate-500">Cargando servicios y profesionales...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 text-[#AB0F66] rounded-xl">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestión de Servicios y Profesionales</h1>
          <p className="text-xs text-slate-400">
            Administra precios, duraciones y asigna qué profesionales realizan cada tratamiento
          </p>
        </div>
      </div>

      {/* Formulario Agregar Nuevo Servicio */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#AB0F66]" /> Nuevo Tratamiento
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nombre del servicio"
              value={editingId === null ? formData.name : ''}
              onChange={(e) => editingId === null && setFormData({ ...formData, name: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
              required
              disabled={editingId !== null}
            />
            <input
              type="number"
              placeholder="Duración (min)"
              value={editingId === null ? formData.duration : ''}
              onChange={(e) => editingId === null && setFormData({ ...formData, duration: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
              required
              disabled={editingId !== null}
            />
            <input
              type="number"
              placeholder="Precio ($)"
              value={editingId === null ? formData.price : ''}
              onChange={(e) => editingId === null && setFormData({ ...formData, price: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
              required
              disabled={editingId !== null}
            />
            <input
              type="number"
              placeholder="Seña ($)"
              value={editingId === null ? formData.deposit : ''}
              onChange={(e) => editingId === null && setFormData({ ...formData, deposit: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
              required
              disabled={editingId !== null}
            />
          </div>

          {/* Selección de Profesionales para Nuevo Servicio */}
          {editingId === null && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#AB0F66]" /> Profesionales que realizan el servicio:
              </label>
              {professionalsList.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No hay profesionales registrados.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {professionalsList.map((prof) => {
                    const isSelected = formData.selectedProfessionals.includes(prof.id);
                    return (
                      <button
                        type="button"
                        key={prof.id}
                        onClick={() => handleToggleProfessional(prof.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#AB0F66] text-white border-[#AB0F66]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {prof.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {editingId === null && (
            <button
              type="submit"
              className="w-full py-2.5 bg-[#AB0F66] hover:bg-[#8F0C54] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Servicio
            </button>
          )}
        </form>
      </div>

      {/* Lista de Servicios */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Servicios Activos</h2>
        <div className="divide-y divide-slate-100">
          {services.map((item) => (
            <div key={item.id} className="py-4 flex flex-col space-y-3 text-xs">
              {editingId === item.id ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-rose-200">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      placeholder="Nombre"
                    />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      placeholder="Duración (min)"
                    />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      placeholder="Precio ($)"
                    />
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      className="p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      placeholder="Seña ($)"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-600">Asignar Profesionales:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {professionalsList.map((prof) => {
                        const isSelected = formData.selectedProfessionals.includes(prof.id);
                        return (
                          <button
                            type="button"
                            key={prof.id}
                            onClick={() => handleToggleProfessional(prof.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                              isSelected
                                ? 'bg-[#AB0F66] text-white border-[#AB0F66]'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {prof.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleSave(item.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-1 font-bold"
                    >
                      <Check className="w-4 h-4" /> Guardar Cambios
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-xl flex items-center gap-1 font-bold"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#AB0F66]" /> {item.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-500" /> Precio: ${item.price}
                      </span>
                      <span className="text-rose-600 font-semibold">Seña: ${item.deposit}</span>
                    </div>

                    {/* Badge de Profesionales asignados */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Atendido por:</span>
                      {item.professionals && item.professionals.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.professionals.map((p) => (
                            <span
                              key={p.id}
                              className="px-2 py-0.5 bg-rose-50 text-[#AB0F66] border border-rose-100 rounded-md text-[10px] font-medium"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Sin profesionales asignados</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-[#AB0F66] cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}