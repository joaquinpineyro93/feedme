const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'pedi_secret_2024';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Campos requeridos' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Usuario ya existe' });
    const user = await User.create({ username, password });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Me
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
