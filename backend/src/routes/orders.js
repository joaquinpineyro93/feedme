const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

async function getRestaurant(req) {
  const tenant = req.headers['x-tenant'];
  if (tenant) return await Restaurant.findOne({ slug: tenant }).select('_id acceptingOrders');

  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];
  const ignored = ['www', 'admin', 'superadmin', 'localhost', 'pedi'];
  if (!ignored.includes(subdomain) && subdomain) {
    return await Restaurant.findOne({ slug: subdomain }).select('_id acceptingOrders');
  }
  return null;
}

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, customerName, customerPhone, address, paymentMethod, notes, total, whatsappSent } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
    }
    if (!customerName || !customerPhone || !address || !paymentMethod) {
      return res.status(400).json({ error: 'Faltan datos del cliente' });
    }

    const restaurant = await getRestaurant(req);
    if (restaurant && restaurant.acceptingOrders === false) {
      return res.status(403).json({ error: 'El local no está aceptando pedidos en este momento' });
    }

    const order = new Order({
      items,
      customerName,
      customerPhone,
      address,
      paymentMethod,
      notes,
      total,
      whatsappSent: whatsappSent !== undefined ? whatsappSent : true,
      restaurantId: restaurant ? restaurant._id : null,
    });

    await order.save();
    res.status(201).json({ message: 'Pedido guardado exitosamente', order });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el pedido', details: error.message });
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos', details: error.message });
  }
});

module.exports = router;
