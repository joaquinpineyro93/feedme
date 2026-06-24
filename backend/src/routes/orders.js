const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

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

    const order = new Order({
      items,
      customerName,
      customerPhone,
      address,
      paymentMethod,
      notes,
      total,
      whatsappSent: whatsappSent !== undefined ? whatsappSent : true,
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
