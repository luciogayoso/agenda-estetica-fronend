import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Calendar, LogOut, Download, Smartphone, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import BookingSuccess from './pages/booking/bookingSuccess';
import BookingWizard from './components/booking/bookingWizard';
import AdminDashboard from './pages/admin/admindashboard';
import Login from './pages/admin/login';
import AIChatWidget from './components/chat/aichatWidget';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('admin_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Instalación aceptada');
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowManualModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/50 flex flex-col justify-between items-center p-4 md:p-8 relative">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '16px',
            border: '1px solid #fecdd3',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />

      {/* Botón flotante para instalar la App */}
      <button
        onClick={handleInstallClick}
        className="fixed bottom-4 left-4 bg-[#AB0F66] hover:bg-[#8F0C54] text-white px-4 py-2.5 rounded-2xl shadow-lg font-bold text-xs flex items-center gap-2 z-40 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4" /> Instalar App
      </button>

      {/* Modal de instrucciones manuales */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl border border-rose-100 relative">
            <button 
              onClick={() => setShowManualModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#AB0F66] font-bold text-base">
              <Smartphone className="w-5 h-5" /> Instalar en tu Celular
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <div className="p-3 bg-rose-50/60 rounded-xl">
                <p className="font-bold text-slate-800 mb-1">Android / Chrome:</p>
                <p>Toca los tres puntos arriba a la derecha y selecciona <strong>"Agregar a la pantalla principal"</strong> o <strong>"Instalar aplicación"</strong>.</p>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl">
                <p className="font-bold text-slate-800 mb-1">iPhone / Safari:</p>
                <p>Toca el botón Compartir (icono con flecha hacia arriba) y selecciona <strong>"Agregar a inicio"</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowManualModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header / Barra Superior */}
      <header className="w-full max-w-3xl flex justify-between items-center py-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-rose-950">Lumière Studio</span>
        </div>

        <nav className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-rose-100 shadow-sm">
          <Link
            to="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-1 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" /> Reservar
          </Link>
          
          <Link
            to="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-rose-50 text-slate-600 flex items-center gap-1 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Admin
          </Link>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          )}
        </nav>
      </header>

      {/* Rutas Principales */}
      <Routes>
        <Route path="/" element={<BookingWizard />} />
        
        {/* Rutas de retorno de Mercado Pago */}
        <Route path="/reserva-exito" element={<BookingSuccess />} />
        <Route path="/reserva-pendiente" element={<BookingSuccess />} />
        <Route path="/reserva-error" element={<BookingWizard />} />

        {/* Panel de Administración / Login */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminDashboard />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
      </Routes>

      {/* Asistente Virtual Inteligente */}
      <AIChatWidget />

      <footer className="mt-8 text-center text-xs text-gray-400">
        © 2026 Lumière Studio • Sistema Inteligente de Reservas
      </footer>
    </div>
  );
}