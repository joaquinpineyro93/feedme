const STORAGE_KEY = 'pedi_admin_desktop_notifications';

export function isDesktopNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isDesktopNotificationEnabled() {
  return isDesktopNotificationSupported()
    && localStorage.getItem(STORAGE_KEY) === 'true'
    && Notification.permission === 'granted';
}

export async function enableDesktopNotifications() {
  if (!isDesktopNotificationSupported()) return { ok: false, reason: 'unsupported' };
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    localStorage.setItem(STORAGE_KEY, 'false');
    return { ok: false, reason: 'denied' };
  }
  localStorage.setItem(STORAGE_KEY, 'true');
  return { ok: true };
}

export function disableDesktopNotifications() {
  localStorage.setItem(STORAGE_KEY, 'false');
}

export function notifyNewOrder(order) {
  if (!isDesktopNotificationEnabled()) return;
  try {
    const body = order?.customerName ? `Pedido de ${order.customerName}` : 'Tenés un nuevo pedido';
    new Notification('Nuevo pedido recibido', { body, tag: 'pedi-new-order' });
  } catch {
    // Falla en silencio si el navegador bloquea la notificación.
  }
}
