import { useState, useEffect } from 'react';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent, getClients } from '../services/api';

const initialForm = {
  client_id: '',
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
};

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [evts, cls] = await Promise.all([getCalendarEvents(), getClients()]);
      setEvents(evts);
      setClients(cls);
    } catch {
      setError('Error conectando con Google Calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time) {
      setError('Título, inicio y fin son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createCalendarEvent(form);
      setForm(initialForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!confirm(`¿Cancelar la sesión "${title}"?`)) return;
    try {
      await deleteCalendarEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch {
      alert('Error al cancelar la sesión');
    }
  };

  const formatDate = (dateTime) => {
    try {
      const date = new Date(dateTime?.dateTime || dateTime?.date);
      return date.toLocaleString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return '—'; }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Calendario</h1>
          <p className="text-slate-400">Sincronizado con Google Calendar</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva sesión
        </button>
      </div>

      {error && !showForm && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No tienes sesiones próximas agendadas</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {events.map(event => (
              <div key={event.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group">
                <div className="w-1 h-10 rounded-full bg-accent-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{event.summary}</p>
                  <p className="text-slate-400 text-sm">{formatDate(event.start)}</p>
                  {event.location && (
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(event.id, event.summary)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-400/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-white">Nueva sesión</h2>
              <button onClick={() => { setShowForm(false); setError(''); setForm(initialForm); }} className="text-slate-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Título *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Ej: Sesión de fuerza con Juan" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Cliente</label>
                <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className="input-field">
                  <option value="">Sin cliente asignado</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Inicio *</label>
                  <input type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Fin *</label>
                  <input type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Ubicación</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="Gym, parque, online..." />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={2} placeholder="Detalles de la sesión..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setError(''); setForm(initialForm); }} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Guardando...' : 'Crear sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}