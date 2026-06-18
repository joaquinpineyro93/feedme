const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  openHours: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
