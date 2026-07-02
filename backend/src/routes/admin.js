const router = require('express').Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');

// All admin routes require auth
router.use(auth);

// --- ORDERS ---
router.get('/orders', async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/history', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from y to son requeridos' });
    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);
    const orders = await Order.find({ createdAt: { $gte: start, $lt: end } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Estado invalido' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS ---
router.get('/products', async (req, res) => {
  try {
    const { restaurantId } = req.user;
    const query = restaurantId ? { restaurantId } : {};
    const products = await Product.find(query).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { restaurantId } = req.user;
    const product = await Product.create({ ...req.body, restaurantId });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk import from Excel
router.post('/products/bulk', async (req, res) => {
  try {
    const { restaurantId } = req.user;
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0)
      return res.status(400).json({ error: 'products debe ser un array no vacío' });

    // Auto-create missing categories
    const restaurant = await Restaurant.findOne(restaurantId ? { _id: restaurantId } : {});
    if (restaurant) {
      const incomingCats = [...new Set(products.filter(p => !p.isDaily && p.category).map(p => p.category))];
      const newCats = incomingCats.filter(c => !restaurant.categories.includes(c));
      if (newCats.length) {
        restaurant.categories = [...restaurant.categories, ...newCats];
        await restaurant.save();
      }
    }

    const created = await Product.insertMany(
      products.map(p => ({ ...p, restaurantId })),
      { ordered: false }
    );
    res.status(201).json({ inserted: created.length, products: created, categories: restaurant?.categories || [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Migrate dailyMenus from restaurant subdoc → Product collection
router.post('/products/migrate-daily-menus', async (req, res) => {
  try {
    const { restaurantId } = req.user;
    const restaurant = await Restaurant.findOne(restaurantId ? { _id: restaurantId } : {});
    if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado' });
    if (!restaurant.dailyMenus?.length) return res.json({ migrated: 0 });

    const toInsert = restaurant.dailyMenus.map(m => ({
      name: m.name,
      description: m.description || '',
      price: m.price,
      category: 'Menú del día',
      image: m.image || '',
      available: true,
      restaurantId: restaurant._id,
      isDaily: true,
      recurrence: m.recurrence,
      dayOfWeek: m.dayOfWeek,
      date: m.date,
      dailyActive: m.active,
    }));

    const created = await Product.insertMany(toInsert);
    restaurant.dailyMenus = [];
    await restaurant.save();

    res.json({ migrated: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DAILY MENUS ---
router.get('/restaurant/daily-menus', async (req, res) => {
  try {
    const r = await Restaurant.findOne();
    res.json(r?.dailyMenus || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/restaurant/daily-menus', async (req, res) => {
  try {
    const r = await Restaurant.findOne();
    r.dailyMenus.push(req.body);
    await r.save();
    res.status(201).json(r.dailyMenus[r.dailyMenus.length - 1]);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/restaurant/daily-menus/:id', async (req, res) => {
  try {
    const r = await Restaurant.findOne();
    const item = r.dailyMenus.id(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    Object.assign(item, req.body);
    await r.save();
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/restaurant/daily-menus/:id', async (req, res) => {
  try {
    const r = await Restaurant.findOne();
    r.dailyMenus.pull({ _id: req.params.id });
    await r.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CATEGORIES ---
router.patch('/restaurant/categories', async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) return res.status(400).json({ error: 'categories debe ser un array' });
    const restaurant = await Restaurant.findOneAndUpdate({}, { categories }, { new: true });
    res.json(restaurant.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RESTAURANT ---
router.get('/restaurant', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/restaurant', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
