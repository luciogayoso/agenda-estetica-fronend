import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Clock, DollarSign, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesManager() {
  const [services, setServices] = useState([
    { id: 1, name: 'Perfilado de Cejas & Henna', duration: 45, price: 12000, deposit: 3000 },
    { id: 2, name: 'Lifting de Pestañas + Nutrición', duration: 60, price: 15000, deposit: 4000 },
    { id: 3, name: 'Limpieza Facial Profunda Glow', duration: 75, price: 22000, deposit: 5000 },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', duration: '', price: '', deposit: '' });

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData(service);
  };

  const handleSave = (id) => {
    setServices(services.map(s => s.id === id ? { ...formData, id } : s));
    setEditingId(null);
    toast.success('Servicio actualizado correctamente', {
      iconTheme: { primary: '#AB0F66', secondary: '#fff' }
    });
  };

  const handleDelete = (id) => {
    setServices(services.filter(s => s.id !== id));
    toast.error('Servicio eliminado');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setServices([
      ...services, 
      { 
        ...formData, 
        id: Date.now(), 
        duration: Number(formData.duration), 
        price: Number(formData.price), 
        deposit: Number(formData.deposit) 
      }
    ]);
    setFormData({ name: '', duration: '', price: '', deposit: '' });
    
    // Notificación Toast al agregar servicio
    toast.success('¡Servicio agregado con éxito!', {
      iconTheme: { primary: '#AB0F66', secondary: '#fff' }
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 text-[#AB0F66] rounded-xl">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestión de Servicios y Precios</h1>
          <p className="text-xs text-slate-400">Modifica precios, valores de seña y duraciones en tiempo real</p>
        </div>
      </div>

      {/* Formulario Agregar Nuevo */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#AB0F66]" /> Nuevo Tratamiento
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
            required
          />
          <input
            type="number"
            placeholder="Duración (min)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
            required
          />
          <input
            type="number"
            placeholder="Precio ($)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
            required
          />
          <input
            type="number"
            placeholder="Seña ($)"
            value={formData.deposit}
            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AB0F66]"
            required
          />
          <button
            type="submit"
            className="sm:col-span-4 py-2.5 bg-[#AB0F66] hover:bg-[#8F0C54] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agregar Servicio
          </button>
        </form>
      </div>

      {/* Lista de Servicios */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Servicios Activos</h2>
        <div className="divide-y divide-slate-100">
          {services.map((item) => (
            <div key={item.id} className="py-3 flex flex-wrap justify-between items-center text-xs gap-2">
              {editingId === item.id ? (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex gap-1">
                    <button onClick={() => handleSave(item.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-300 text-slate-700 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#AB0F66]" /> {item.duration} min</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500" /> Precio: ${item.price}</span>
                      <span className="text-rose-600 font-semibold">Seña: ${item.deposit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-500 hover:text-[#AB0F66] cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}