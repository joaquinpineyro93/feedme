import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import api from '../api';

function today() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function formatDay(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!from || !to) return;
    if (from > to) { setError('La fecha de inicio no puede ser mayor a la de fin'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/orders/stats', { params: { from, to } });
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const chartData = (stats?.timeline || []).map(t => ({
    day: formatDay(t.date),
    Ventas: t.orders,
    Facturación: t.revenue,
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Estadísticas</h2>
      </div>

      <div className="history-filters">
        <div className="history-filter-group">
          <label className="form-label">Desde</label>
          <input
            type="date"
            className="form-input"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="history-filter-group">
          <label className="form-label">Hasta</label>
          <input
            type="date"
            className="form-input"
            value={to}
            min={from}
            max={today()}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button className="btn-primary history-search-btn" onClick={fetchStats} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p className="loading-text">Cargando...</p>
      ) : !stats || stats.totalOrders === 0 ? (
        <p className="empty-text">No hay pedidos en el rango seleccionado.</p>
      ) : (
        <>
          <div className="history-summary">
            <div className="summary-stat">
              <span className="summary-label">Pedidos</span>
              <span className="summary-value">{stats.totalOrders}</span>
            </div>
            <div className="summary-stat highlight">
              <span className="summary-label">Total facturado</span>
              <span className="summary-value">${stats.totalRevenue.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="stats-grid">
            <section className="stats-card">
              <h3 className="stats-card-title">Clientes con más compras</h3>
              {stats.topClients.length === 0 ? (
                <p className="empty-text">Sin datos.</p>
              ) : (
                <ul className="stats-list">
                  {stats.topClients.map((c, i) => (
                    <li key={`${c.name}-${c.phone}`} className="stats-list-row">
                      <span className="stats-list-rank">{i + 1}</span>
                      <div className="stats-list-info">
                        <span className="stats-list-name">{c.name}</span>
                        <span className="stats-list-sub">{c.phone}</span>
                      </div>
                      <div className="stats-list-metric">
                        <span className="stats-list-value">{c.orders} pedidos</span>
                        <span className="stats-list-sub">${c.total.toLocaleString('es-AR')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="stats-card">
              <h3 className="stats-card-title">Productos más vendidos</h3>
              {stats.topProducts.length === 0 ? (
                <p className="empty-text">Sin datos.</p>
              ) : (
                <ul className="stats-list">
                  {stats.topProducts.map((p, i) => (
                    <li key={p.name} className="stats-list-row">
                      <span className="stats-list-rank">{i + 1}</span>
                      <div className="stats-list-info">
                        <span className="stats-list-name">{p.name}</span>
                      </div>
                      <div className="stats-list-metric">
                        <span className="stats-list-value">{p.quantity} unidades</span>
                        <span className="stats-list-sub">${p.revenue.toLocaleString('es-AR')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="stats-card stats-chart-card">
            <h3 className="stats-card-title">Ventas y facturación por día</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString('es-AR')}`} />
                <Tooltip formatter={(value, name) => name === 'Facturación' ? [`$${value.toLocaleString('es-AR')}`, name] : [value, name]} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Ventas" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="Facturación" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </div>
  );
}
