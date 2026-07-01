import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText } from 'lucide-react';
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
  const isDelivery = order.address && order.address !== 'A levantar';
  const lines = order.items.map((i) => `- ${i.quantity}x ${i.name}`);
  return [
    '---------------------------------',
    isDelivery
      ? `Hola ${order.customerName}! Tu pedido está en camino.`
      : `Hola ${order.customerName}! Tu pedido está listo para retirar.`,
    '---------------------------------',
    '*Tu pedido:*',
    ...lines,
    '---------------------------------',
    `*Total: $${order.total.toLocaleString('es-AR')}*`,
    `*Pago: ${order.paymentMethod}*`,
    '---------------------------------',
    isDelivery ? '¡Ya está en camino! Gracias.' : '¡Podés pasar a buscarlo! Gracias.',
  ].join('\n');
}

function OrderCard({ order, onStatusChange }) {
  const [notifyPrompt, setNotifyPrompt] = useState(false);
  const next = STATUS_NEXT[order.status];

  const handleStatusChange = (id, status) => {
    if (status === 'ready' && order.customerPhone) {
      setNotifyPrompt(true);
      return;
    }
    onStatusChange(id, status);
  };

  const confirmReady = (notify) => {
    setNotifyPrompt(false);
    if (notify) {
      const msg = buildReadyMessage(order);
      const phone = order.customerPhone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    onStatusChange(order._id, 'ready');
  };
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
            {order.address === 'A levantar'
              ? <span className="delivery-pill delivery-pill--pickup">A levantar</span>
              : <span className="delivery-pill delivery-pill--delivery">Envío</span>
            }
          </div>
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
        <div className="order-customer-grid">
          <div className="order-customer-field">
            <span className="order-field-label">Nombre</span>
            <span className="order-field-value">{order.customerName}</span>
          </div>
          <div className="order-customer-field">
            <span className="order-field-label">Teléfono</span>
            <span className="order-field-value">{order.customerPhone || '—'}</span>
          </div>
          {order.address && order.address !== 'A levantar' && (
            <div className="order-customer-field" style={{ gridColumn: '1 / -1' }}>
              <span className="order-field-label">Dirección</span>
              <span className="order-field-value">{order.address}</span>
            </div>
          )}
          <div className="order-customer-field">
            <span className="order-field-label">Pago</span>
            <span className="order-field-value">{order.paymentMethod}</span>
          </div>
        </div>
        {order.notes && <span className="order-notes"><FileText size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{order.notes}</span>}
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

      {notifyPrompt && (
        <div className="notify-prompt">
          <p className="notify-prompt-text">¿Notificar al cliente?</p>
          <div className="notify-prompt-actions">
            <button className="btn-status-next" onClick={() => confirmReady(true)}>Notificar por WA</button>
            <button className="btn-secondary" onClick={() => confirmReady(false)}>Solo marcar listo</button>
          </div>
        </div>
      )}

      {!notifyPrompt && (
        <div className="order-actions">
          {next && (
            <button className="btn-status-next" onClick={() => handleStatusChange(order._id, next)}>
              Marcar como {STATUS_LABELS[next]}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button className="btn-status-cancel" onClick={() => onStatusChange(order._id, 'cancelled')}>
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
