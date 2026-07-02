const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  // Menú del día
  isDaily:     { type: Boolean, default: false },
  recurrence:  { type: String, enum: ['weekly', 'once'] },
  dayOfWeek:   { type: Number, min: 0, max: 6 },
  date:        { type: String },
  dailyActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
