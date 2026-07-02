const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

async function getRestaurantId(req) {
  const tenant = req.headers['x-tenant'];
  if (tenant) {
    const r = await Restaurant.findOne({ slug: tenant }).select('_id');
    return r ? r._id : null;
  }
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];
  const ignored = ['www', 'admin', 'superadmin', 'localhost', 'pedi'];
  if (!ignored.includes(subdomain) && subdomain) {
    const r = await Restaurant.findOne({ slug: subdomain }).select('_id');
    return r ? r._id : null;
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

    const restaurantId = await getRestaurantId(req);
    const order = new Order({
      items,
      customerName,
      customerPhone,
      address,
      paymentMethod,
      notes,
      total,
      whatsappSent: whatsappSent !== undefined ? whatsappSent : true,
      restaurantId,
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
