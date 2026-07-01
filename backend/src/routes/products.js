const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req);
    const query = { available: true };
    if (restaurantId) query.restaurantId = restaurantId;
    const products = await Product.find(query).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto', details: error.message });
  }
});

module.exports = router;
