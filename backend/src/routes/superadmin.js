const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Order = require('../models/Order');
const superAuth = require('../middleware/superauth');
const { startOfDayInAppTz, toDateStringInAppTz } = require('../utils/dateHelpers');

const SECRET = process.env.SUPERADMIN_JWT_SECRET || 'superadmin_dev_secret';

// Login — credentials come from .env
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.SUPERADMIN_USER;
  const validPass = process.env.SUPERADMIN_PASS;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: 'Superadmin credentials not configured' });
  }
  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ username, role: 'superadmin' }, SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// All routes below require superadmin auth
router.use(superAuth);

// List all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('-dailyMenus').sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new restaurant
router.post('/restaurants', async (req, res) => {
  try {
    const { name, slug, phone, address, description, openHours } = req.body;
    if (!name || !slug || !phone || !address) {
      return res.status(400).json({ error: 'name, slug, phone y address son requeridos' });
    }
    const restaurant = await Restaurant.create({ name, slug, phone, address, description, openHours, active: true });
    res.status(201).json(restaurant);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'El slug ya está en uso' });
    res.status(400).json({ error: err.message });
  }
});

// Update restaurant data
router.patch('/restaurants/:id', async (req, res) => {
  try {
    const { name, slug, phone, address, description, openHours } = req.body;
    const update = { name, slug, phone, address, description, openHours };
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-dailyMenus');
    if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json(restaurant);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'El slug ya está en uso' });
    res.status(400).json({ error: err.message });
  }
});

// Toggle active/inactive
router.patch('/restaurants/:id/active', async (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') return res.status(400).json({ error: 'active debe ser boolean' });
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { active }, { new: true }).select('-dailyMenus');
    if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a restaurant
router.delete('/restaurants/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin user for a restaurant (returns username only, never password)
router.get('/restaurants/:id/user', async (req, res) => {
  try {
    const user = await User.findOne({ restaurantId: req.params.id }).select('username');
    res.json(user || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update admin user for a restaurant
router.put('/restaurants/:id/user', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const existing = await User.findOne({ restaurantId: req.params.id });
    if (existing) {
      existing.username = username;
      existing.password = password; // pre-save hook re-hashes
      await existing.save();
      return res.json({ username: existing.username });
    }

    // Check username not taken by another user
    const taken = await User.findOne({ username });
    if (taken) return res.status(400).json({ error: 'Ese usuario ya está en uso' });

    const user = await User.create({ username, password, restaurantId: req.params.id });
    res.status(201).json({ username: user.username });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Ese usuario ya está en uso' });
    res.status(400).json({ error: err.message });
  }
});

// Aggregated sales stats across all restaurants (or a subset), filtered by date range
router.get('/stats', async (req, res) => {
  try {
    const { from, to, restaurantIds } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from y to son requeridos' });
    const start = startOfDayInAppTz(from);
    const end = startOfDayInAppTz(to);
    end.setUTCDate(end.getUTCDate() + 1);

    const filter = { createdAt: { $gte: start, $lt: end } };
    if (restaurantIds) {
      const ids = restaurantIds.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length) filter.restaurantId = { $in: ids };
    }

    const [orders, restaurants] = await Promise.all([
      Order.find(filter).sort({ createdAt: 1 }),
      Restaurant.find().select('name slug'),
    ]);
    const restaurantById = new Map(restaurants.map((r) => [String(r._id), r]));
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    // Sales ranked by restaurant
    const restaurantMap = new Map();
    for (const o of validOrders) {
      const key = String(o.restaurantId);
      const r = restaurantById.get(key);
      const entry = restaurantMap.get(key) || {
        restaurantId: key,
        name: r?.name || 'Local eliminado',
        slug: r?.slug || '',
        orders: 0,
        revenue: 0,
      };
      entry.orders += 1;
      entry.revenue += o.total;
      restaurantMap.set(key, entry);
    }
    const byRestaurant = [...restaurantMap.values()].sort((a, b) => b.revenue - a.revenue);

    // Daily timeline: order count + revenue per day, across all restaurants
    const dayMap = new Map();
    for (const o of validOrders) {
      const day = toDateStringInAppTz(o.createdAt);
      const entry = dayMap.get(day) || { date: day, orders: 0, revenue: 0 };
      entry.orders += 1;
      entry.revenue += o.total;
      dayMap.set(day, entry);
    }
    const timeline = [...dayMap.values()].sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalOrders: validOrders.length,
      totalRevenue: validOrders.reduce((sum, o) => sum + o.total, 0),
      totalRestaurants: byRestaurant.length,
      byRestaurant,
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
