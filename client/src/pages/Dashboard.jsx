import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const levelLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const levelColor = { beginner: 'bg-emerald-500/15 text-emerald-400', intermediate: 'bg-amber-500/15 text-amber-400', advanced: 'bg-red-500/15 text-red-400' };

export default function Dashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeClients = clients.filter(c => c.active);
  const levels = clients.reduce((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">
          Hola, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400">Aquí está el resumen de tu actividad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-slate-400 text-sm mb-1">Clientes totales</p>
          <p className="font-display text-3xl font-bold text-white">{clients.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-slate-400 text-sm mb-1">Clientes activos</p>
          <p className="font-display text-3xl font-bold text-emerald-400">{activeClients.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-slate-400 text-sm mb-1">Avanzados</p>
          <p className="font-display text-3xl font-bold text-accent-400">{levels['advanced'] || 0}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-white">Clientes recientes</h2>
          <Link to="/clients" className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-4">Aún no tienes clientes registrados</p>
            <Link to="/clients" className="btn-primary text-sm">+ Agregar primer cliente</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.slice(0, 5).map(client => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-semibold font-display">
                  {client.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium group-hover:text-accent-300 transition-colors truncate">{client.name}</p>
                  <p className="text-slate-500 text-xs truncate">{client.goal || 'Sin objetivo definido'}</p>
                </div>
                <span className={`badge ${levelColor[client.level] || levelColor.beginner}`}>
                  {levelLabel[client.level] || client.level}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}