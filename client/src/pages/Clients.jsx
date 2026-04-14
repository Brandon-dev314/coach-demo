import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClients, createClient, deleteClient } from '../services/api';

const levelLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const levelColor = { beginner: 'bg-emerald-500/15 text-emerald-400', intermediate: 'bg-amber-500/15 text-amber-400', advanced: 'bg-red-500/15 text-red-400' };

const initialForm = { name: '', email: '', phone: '', goal: '', level: 'beginner', weight: '', height: '', notes: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getClients().then(setClients).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError('');
    try {
      await createClient(form);
      setForm(initialForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Error al eliminar cliente');
    }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Clientes</h1>
          <p className="text-slate-400">{clients.length} clientes registrados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cliente
        </button>
      </div>

      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">{search ? 'Sin resultados' : 'No tienes clientes aún'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Objetivo</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Nivel</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to={`/clients/${client.id}`} className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-semibold">
                        {client.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-accent-400 transition-colors">{client.name}</p>
                        <p className="text-slate-500 text-xs">{client.email || '—'}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-slate-300 text-sm truncate max-w-xs">{client.goal || '—'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${levelColor[client.level] || levelColor.beginner}`}>
                      {levelLabel[client.level] || client.level}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/clients/${client.id}`} className="btn-ghost text-xs py-1 px-3">Ver</Link>
                      <button onClick={() => handleDelete(client.id, client.name)} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-white">Nuevo cliente</h2>
              <button onClick={() => { setShowForm(false); setError(''); setForm(initialForm); }} className="text-slate-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Nombre *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Nombre completo" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Teléfono</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="55 1234 5678" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Objetivo</label>
                  <input value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} className="input-field" placeholder="Ej: Bajar 10kg, ganar músculo..." />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Nivel</label>
                  <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="input-field">
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Peso (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="input-field" placeholder="70" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Altura (cm)</label>
                  <input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})} className="input-field" placeholder="170" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Notas</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field resize-none" rows={2} placeholder="Lesiones previas, consideraciones especiales..." />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setError(''); setForm(initialForm); }} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Guardando...' : 'Guardar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}