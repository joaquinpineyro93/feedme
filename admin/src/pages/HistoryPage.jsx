import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, X } from 'lucide-react';
import api from '../api';

const STATUS_LABELS = {
  pending: 'Pendiente',
  preparing: 'En preparacion',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS = {
  pending: '#F59E0B',
  preparing: '#3B82F6',
  ready: '#10B981',
  delivered: '#6B7280',
  cancelled: '#EF4444',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(daysAgo(7));
  const [to, setTo] = useState(today());
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    if (!from || !to) return;
    if (from > to) { setError('La fecha de inicio no puede ser mayor a la de fin'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/orders/history', { params: { from, to } });
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const deleteOrder = async (id) => {
    if (!confirm('¿Eliminar este pedido definitivamente? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/api/admin/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert('Error al eliminar el pedido');
    }
  };

  const exportExcel = () => {
    const rows = orders.map(o => ({
      'ID': `#${o._id.slice(-6).toUpperCase()}`,
      'Fecha': new Date(o.createdAt).toLocaleDateString('es-AR'),
      'Hora': new Date(o.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      'Cliente': o.customerName,
      'Teléfono': o.customerPhone || '',
      'Dirección': o.address,
      'Items': o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      'Pago': o.paymentMethod,
      'Total': o.total,
      'Estado': STATUS_LABELS[o.status] || o.status,
      'Notas': o.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [6,10,6,16,12,20,30,10,10,12,20].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    XLSX.writeFile(wb, `historial_${from}_${to}.xlsx`);
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Historial de pedidos</h2>
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
        <button className="btn-primary history-search-btn" onClick={fetchHistory} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        {orders.length > 0 && (
          <button className="btn-secondary history-search-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={exportExcel}>
            <Download size={15} /> Exportar Excel
          </button>
        )}
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {!loading && orders.length > 0 && (
        <div className="history-summary">
          <div className="summary-stat">
            <span className="summary-label">Pedidos</span>
            <span className="summary-value">{orders.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Entregados</span>
            <span className="summary-value">{orders.filter(o => o.status === 'delivered').length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Cancelados</span>
            <span className="summary-value">{orders.filter(o => o.status === 'cancelled').length}</span>
          </div>
          <div className="summary-stat highlight">
            <span className="summary-label">Total facturado</span>
            <span className="summary-value">${totalRevenue.toLocaleString('es-AR')}</span>
          </div>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="empty-text">No hay pedidos en el rango seleccionado.</p>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y hora</th>
                <th>Cliente</th>
                <th>Direccion</th>
                <th>Items</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id-cell">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="date-cell">
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}<br />
                    <span className="time-sub">{new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td>{order.customerName}</td>
                  <td className="address-cell">{order.address}</td>
                  <td className="items-cell">
                    {order.items.map((item, i) => (
                      <span key={i} className="item-pill">{item.quantity}x {item.name}</span>
                    ))}
                  </td>
                  <td>{order.paymentMethod}</td>
                  <td className="total-cell">${order.total.toLocaleString('es-AR')}</td>
                  <td>
                    <span className="order-status-badge" style={{ background: STATUS_COLORS[order.status] }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td>
                    <button className="order-delete-btn" onClick={() => deleteOrder(order._id)} title="Eliminar pedido">
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
