import React, { useState } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola bella! 🌸 Soy Lumi, tu compinche de belleza. ¿Qué tratamiento tienes ganas de hacerte hoy o qué dudas tienes?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Hubo un error al consultar. Inténtalo de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
        onClick={() => setIsOpen(true)}
        className="bg-[#AB0F66] hover:bg-[#8F0C54] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        >
          <Sparkles className="w-6 h-6" />
          <span className="font-medium text-sm hidden md:inline">¿Dudas? Pregúntale a Lumi</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col h-[480px] overflow-hidden">
          {/* Header */}
          <div className="bg-rose-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Lumi • Asistente de Belleza</h4>
                <p className="text-[10px] text-rose-100">Responde en segundos con IA</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-rose-50/20 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-rose-500 text-white rounded-br-none'
                      : 'bg-white text-slate-700 shadow-sm border border-rose-100 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-slate-400 italic text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin text-rose-400" /> Lumi está pensando...
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-rose-100 flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-500 text-white p-2 rounded-xl hover:bg-rose-600 disabled:bg-gray-300 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}