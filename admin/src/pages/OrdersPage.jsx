import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const STATUS_LABELS = {
  pending: 'Pendiente',
  preparing: 'En preparacion',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_NEXT = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

const STATUS_COLORS = {
  pending: '#F59E0B',
  preparing: '#3B82F6',
  ready: '#10B981',
  delivered: '#6B7280',
  cancelled: '#EF4444',
};

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-AR');
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const [newAlert, setNewAlert] = useState(false);

  const fetchOrders = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/api/admin/orders', { params });
      setOrders(data);
      // Alert if new orders came in
      if (lastCount > 0 && data.length > lastCount) {
        setNewAlert(true);
        setTimeout(() => setNewAlert(false), 4000);
      }
      setLastCount(data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, lastCount]);

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 15000);
    return () => clearInterval(interval);
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/api/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const historyOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="page">
      {newAlert && (
        <div className="new-order-alert">Nuevo pedido recibido!</div>
      )}

      <div className="page-header">
        <h2 className="page-title">Pedidos</h2>
        <button className="btn-refresh" onClick={() => fetchOrders(false)} title="Actualizar">
          &#x21bb; Actualizar
        </button>
      </div>

      <div className="filter-tabs">
        {['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            className={`filter-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="empty-text">No hay pedidos {filter !== 'all' ? `con estado "${STATUS_LABELS[filter]}"` : ''}.</p>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <section>
              <h3 className="section-label">Activos ({activeOrders.length})</h3>
              <div className="orders-grid">
                {activeOrders.map((order) => (
                  <OrderCard key={order._id} order={order} onStatusChange={updateStatus} />
                ))}
              </div>
            </section>
          )}
          {historyOrders.length > 0 && (
            <section style={{ marginTop: '2rem' }}>
              <h3 className="section-label">Historial ({historyOrders.length})</h3>
              <div className="orders-grid">
                {historyOrders.map((order) => (
                  <OrderCard key={order._id} order={order} onStatusChange={updateStatus} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function buildReadyMessage(order) {
  const lines = order.items.map((i) => `- ${i.quantity}x ${i.name}`);
  return [
    '---------------------------------',
    `Hola ${order.customerName}! Tu pedido en Burger Bros esta listo.`,
    '---------------------------------',
    '*Tu pedido:*',
    ...lines,
    '---------------------------------',
    `*Total: $${order.total.toLocaleString('es-AR')}*`,
    `*Pago: ${order.paymentMethod}*`,
    '---------------------------------',
    'En breve lo estamos despachando. Gracias!',
  ].join('\n');
}

function OrderCard({ order, onStatusChange }) {
  const next = STATUS_NEXT[order.status];

  const handleStatusChange = (id, status) => {
    if (status === 'ready' && order.customerPhone) {
      const msg = buildReadyMessage(order);
      const phone = order.customerPhone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    onStatusChange(id, status);
  };
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
          <span className="order-time">{formatDate(order.createdAt)} {formatTime(order.createdAt)}</span>
        </div>
        <span
          className="order-status-badge"
          style={{ background: STATUS_COLORS[order.status] }}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="order-customer">
        <strong>{order.customerName}</strong>
        {order.customerPhone && <span>{order.customerPhone}</span>}
        <span>{order.address}</span>
        <span className="order-payment">{order.paymentMethod}</span>
      </div>

      <ul className="order-items">
        {order.items.map((item, i) => (
          <li key={i} className="order-item-row">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
          </li>
        ))}
      </ul>

      <div className="order-total">
        Total: <strong>${order.total.toLocaleString('es-AR')}</strong>
      </div>

      <div className="order-actions">
        {next && (
          <button
            className="btn-status-next"
            onClick={() => handleStatusChange(order._id, next)}
          >
            Marcar como {STATUS_LABELS[next]}
            {next === 'ready' && order.customerPhone ? ' + Notificar' : ''}
          </button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            className="btn-status-cancel"
            onClick={() => onStatusChange(order._id, 'cancelled')}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
