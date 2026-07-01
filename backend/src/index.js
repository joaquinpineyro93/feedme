require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const restaurantRouter = require('./routes/restaurant');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const superadminRouter = require('./routes/superadmin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure DB is connected before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/restaurant', restaurantRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/superadmin', superadminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando!' });
});

// Local dev: listen on port
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
}

module.exports = app;
