import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, updateClient, deleteClient } from '../services/api';

const levelLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const levelColor = { beginner: 'bg-emerald-500/15 text-emerald-400', intermediate: 'bg-amber-500/15 text-amber-400', advanced: 'bg-red-500/15 text-red-400' };

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClient(id)
      .then(data => { setClient(data); setForm(data); })
      .catch(() => navigate('/clients'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateClient(id, form);
      setClient(updated);
      setEditing(false);
    } catch {
      alert('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${client.name}?`)) return;
    await deleteClient(id);
    navigate('/clients');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full p-8">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/clients" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a clientes
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold font-display text-2xl">
            {client.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{client.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${levelColor[client.level] || levelColor.beginner}`}>
                {levelLabel[client.level] || client.level}
              </span>
              <span className={`badge ${client.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                {client.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="btn-ghost text-sm">Editar</button>
              <button onClick={handleDelete} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditing(false); setForm(client); }} className="btn-ghost text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Guardar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-accent-400">{client.total_sessions || 0}</p>
          <p className="text-slate-500 text-xs mt-0.5">Sesiones totales</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-white">{client.weight ? `${client.weight}kg` : '—'}</p>
          <p className="text-slate-500 text-xs mt-0.5">Peso</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-white">{client.height ? `${client.height}cm` : '—'}</p>
          <p className="text-slate-500 text-xs mt-0.5">Altura</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        {[
          { label: 'Email', field: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
          { label: 'Teléfono', field: 'phone', type: 'text', placeholder: '55 1234 5678' },
          { label: 'Objetivo', field: 'goal', type: 'text', placeholder: 'Objetivo de entrenamiento' },
        ].map(({ label, field, type, placeholder }) => (
          <div key={field}>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
            {editing
              ? <input type={type} value={form[field] || ''} onChange={e => setForm({...form, [field]: e.target.value})} className="input-field" placeholder={placeholder} />
              : <p className="text-white">{client[field] || <span className="text-slate-500">—</span>}</p>
            }
          </div>
        ))}

        {editing && (
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-1.5 block">Nivel</label>
            <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="input-field">
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide mb-1.5 block">Notas</label>
          {editing
            ? <textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} className="input-field resize-none" rows={3} placeholder="Lesiones, consideraciones especiales..." />
            : <p className="text-white whitespace-pre-wrap">{client.notes || <span className="text-slate-500">Sin notas</span>}</p>
          }
        </div>
      </div>
    </div>
  );
}