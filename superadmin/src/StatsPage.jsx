import { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import api from './api';
import { today, startOfMonth } from './utils/date';

function formatDay(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function RestaurantFilter({ restaurants, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const label = selected.length === 0
    ? 'Todos los locales'
    : selected.length === 1
      ? restaurants.find((r) => r._id === selected[0])?.name || '1 local'
      : `${selected.length} locales`;

  return (
    <div className="restaurant-filter" ref={ref}>
      <label className="form-label">Locales</label>
      <button type="button" className="restaurant-filter-btn" onClick={() => setOpen((v) => !v)}>
        <span className="restaurant-filter-label">{label}</span>
        <span className={`restaurant-filter-chevron${open ? ' restaurant-filter-chevron--open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="restaurant-filter-panel">
          <div className="restaurant-filter-actions">
            <button type="button" onClick={() => onChange([])}>Todos</button>
            <button type="button" onClick={() => onChange(restaurants.map((r) => r._id))}>Seleccionar todos</button>
          </div>
          <ul className="restaurant-filter-list">
            {restaurants.map((r) => (
              <li key={r._id}>
                <label className="restaurant-filter-opt">
                  <input
                    type="checkbox"
                    checked={selected.includes(r._id)}
                    onChange={() => toggle(r._id)}
                  />
                  {r.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(startOfMonth());
  const [to, setTo] = useState(today());
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/restaurants').then(({ data }) => setRestaurants(data)).catch(() => {});
  }, []);

  const fetchStats = async () => {
    if (!from || !to) return;
    if (from > to) { setError('La fecha de inicio no puede ser mayor a la de fin'); return; }
    setError('');
    setLoading(true);
    try {
      const params = { from, to };
      if (selectedIds.length) params.restaurantIds = selectedIds.join(',');
      const { data } = await api.get('/stats', { params });
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [selectedIds]);

  const chartData = (stats?.timeline || []).map(t => ({
    day: formatDay(t.date),
    Ventas: t.orders,
    Facturación: t.revenue,
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Métricas de ventas</div>
          <div className="page-sub">Ventas de todos los locales, filtradas por fecha</div>
        </div>
      </div>

      <div className="history-filters">
        <RestaurantFilter restaurants={restaurants} selected={selectedIds} onChange={setSelectedIds} />
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
        <button className="btn btn-primary history-search-btn" onClick={fetchStats} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      ) : !stats || stats.totalOrders === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay pedidos en el rango seleccionado.</p>
      ) : (
        <>
          <div className="history-summary">
            <div className="summary-stat">
              <span className="summary-label">Locales con ventas</span>
              <span className="summary-value">{stats.totalRestaurants}</span>
            </div>
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
              <h3 className="stats-card-title">Ranking de locales por facturación</h3>
              {stats.byRestaurant.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Sin datos.</p>
              ) : (
                <ul className="stats-list">
                  {stats.byRestaurant.map((r, i) => (
                    <li key={r.restaurantId} className="stats-list-row">
                      <span className="stats-list-rank">{i + 1}</span>
                      <div className="stats-list-info">
                        <span className="stats-list-name">{r.name}</span>
                        {r.slug && <span className="stats-list-sub">/{r.slug}</span>}
                      </div>
                      <div className="stats-list-metric">
                        <span className="stats-list-value">${r.revenue.toLocaleString('es-AR')}</span>
                        <span className="stats-list-sub">{r.orders} pedidos</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="stats-card stats-chart-card">
            <h3 className="stats-card-title">Ventas y facturación por día (todos los locales)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" fontSize={12} stroke="var(--text-muted)" />
                <YAxis yAxisId="left" fontSize={12} allowDecimals={false} stroke="var(--text-muted)" />
                <YAxis yAxisId="right" orientation="right" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString('es-AR')}`} stroke="var(--text-muted)" />
                <Tooltip formatter={(value, name) => name === 'Facturación' ? [`$${value.toLocaleString('es-AR')}`, name] : [value, name]} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Ventas" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="Facturación" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </>
  );
}
