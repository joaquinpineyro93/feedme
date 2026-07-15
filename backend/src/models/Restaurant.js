const mongoose = require('mongoose');

const dailyMenuSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  recurrence:  { type: String, enum: ['weekly', 'once'], required: true },
  dayOfWeek:   { type: Number, min: 0, max: 6 },  // 0=Dom, 1=Lun ... 6=Sáb (solo weekly)
  date:        { type: String },                    // "YYYY-MM-DD" (solo once)
  image:       { type: String, default: '' },
  active:      { type: Boolean, default: true },
}, { _id: true });

const BANKS = ['BBVA', 'BROU', 'Citi Bank', 'Itaú', 'Mi Dinero', 'Prex', 'Santander', 'Scotiabank'];

const paymentMethodsSchema = new mongoose.Schema({
  cash:        { type: Boolean, default: true },
  card:        { type: Boolean, default: false },
  mercadoPago: {
    enabled: { type: Boolean, default: false },
    link:    { type: String, default: '' },
  },
  bankTransfer: {
    enabled:       { type: Boolean, default: false },
    bank:          { type: String, enum: [...BANKS, ''], default: '' },
    accountNumber: { type: String, default: '' },
  },
}, { _id: false });

const fulfillmentMethodsSchema = new mongoose.Schema({
  delivery: { type: Boolean, default: true },
  pickup:   { type: Boolean, default: true },
}, { _id: false });

const notificationSettingsSchema = new mongoose.Schema({
  whatsappOrders: { type: Boolean, default: false },
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  openHours: { type: String },
  logo: { type: String },
  heroImage: { type: String },
  active: { type: Boolean, default: true },
  acceptingOrders: { type: Boolean, default: true },
  categories: { type: [String], default: ['General'] },
  dailyMenus: { type: [dailyMenuSchema], default: [] },
  paymentMethods: { type: paymentMethodsSchema, default: () => ({}) },
  fulfillmentMethods: { type: fulfillmentMethodsSchema, default: () => ({}) },
  notifications: { type: notificationSettingsSchema, default: () => ({}) },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
