const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

function getSlug(req) {
  // Frontend sends X-Tenant header with the subdomain
  const tenant = req.headers['x-tenant'];
  if (tenant) return tenant;

  // Fallback: read from Host header (works in local dev)
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];
  const ignored = ['www', 'admin', 'superadmin', 'localhost', 'pedi'];
  if (ignored.includes(subdomain) || !subdomain) return null;
  return subdomain;
}

// GET /api/restaurant
router.get('/', async (req, res) => {
  try {
    const slug = getSlug(req);
    const restaurant = slug
      ? await Restaurant.findOne({ slug })
      : await Restaurant.findOne();

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener info del restaurante', details: error.message });
  }
});

module.exports = router;
