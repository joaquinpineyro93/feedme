import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import { playSuccessSound } from '../utils/sound';
import { notifyNewOrder } from '../utils/desktopNotifications';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [unseenCount, setUnseenCount] = useState(0);
  const knownIdsRef = useRef(null);

  const fetchOrders = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await api.get('/api/admin/orders');
      setOrders(data);
      const currentIds = new Set(data.map((o) => o._id));
      const prevIds = knownIdsRef.current;
      if (prevIds) {
        const freshOrders = data.filter((o) => !prevIds.has(o._id));
        const freshIds = freshOrders.map((o) => o._id);
        if (freshIds.length > 0) {
          playSuccessSound();
          notifyNewOrder(freshOrders[0]);
          setUnseenCount((c) => c + freshIds.length);
          setNewOrderIds((prev) => new Set([...prev, ...freshIds]));
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              freshIds.forEach((id) => next.delete(id));
              return next;
            });
          }, 5000);
        }
      }
      knownIdsRef.current = currentIds;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 15000);
    return () => clearInterval(interval);
  }, [user, fetchOrders]);

  const markOrdersSeen = useCallback(() => setUnseenCount(0), []);

  return (
    <OrdersContext.Provider value={{ orders, loading, newOrderIds, unseenCount, fetchOrders, markOrdersSeen }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
