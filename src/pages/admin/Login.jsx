import React, { useState } from 'react';
import { Lock, User, Sparkles } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validación básica o llamada a API (ej. admin@estetica.com / admin123)
    if (email === 'admin@estetica.com' && password === 'admin123') {
      setError('');
      onLogin(true);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-rose-100 my-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-800">Acceso Administrativo</h2>
        <p className="text-xs text-slate-400">Ingresa tus datos para gestionar la agenda</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl text-center font-semibold border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Correo</label>
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 focus-within:border-rose-400">
            <User className="w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="admin@estetica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Contraseña</label>
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 focus-within:border-rose-400">
            <Lock className="w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all text-sm cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}