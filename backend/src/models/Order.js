const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variantLabels: { type: [String], default: [] },
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true, enum: ['Efectivo', 'Mercado Pago', 'Tarjeta'] },
  total: { type: Number, required: true },
  notes: { type: String, default: '' },
  whatsappSent: { type: Boolean, default: true },
  status: { type: String, default: 'pending' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
