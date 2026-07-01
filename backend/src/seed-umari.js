require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Restaurant = require('./models/Restaurant');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pedi';

const CATEGORIES = ['Entradas', 'Platos principales', 'Postres', 'Bebidas'];

const PRODUCTS = [
  // Entradas
  {
    name: 'Ceviche de corvina',
    description: 'Corvina fresca marinada en limón, cebolla morada, cilantro y ají amarillo',
    price: 520,
    category: 'Entradas',
    image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Causa limeña',
    description: 'Papa amarilla con atún, palta y mayonesa',
    price: 420,
    category: 'Entradas',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Tequeños de queso',
    description: 'Palitos de masa frita rellenos de queso blanco, porción x6',
    price: 390,
    category: 'Entradas',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&h=300&fit=crop',
    available: true,
  },

  // Platos principales
  {
    name: 'Lomo saltado',
    description: 'Tiras de lomo, tomate, cebolla, sillao y arroz blanco',
    price: 780,
    category: 'Platos principales',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Ají de gallina',
    description: 'Pollo desmenuzado en salsa de ají amarillo, arroz y papa',
    price: 680,
    category: 'Platos principales',
    image: 'https://images.unsplash.com/photo-1585238341710-4d3ff484184d?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Arroz con leche y mazamorra',
    description: 'Combinación clásica: arroz con leche cremoso y mazamorra morada',
    price: 350,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Suspiro limeño',
    description: 'Dulce de leche con merengue de oporto',
    price: 320,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
    available: true,
  },

  // Bebidas
  {
    name: 'Chicha morada',
    description: 'Bebida fría de maíz morado con piña, canela y clavo',
    price: 220,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Limonada frozen',
    description: 'Limón sutil, azúcar y hielo',
    price: 250,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'Agua mineral',
    description: 'Sin gas, 500ml',
    price: 150,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
    available: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    const restaurant = await Restaurant.findOne({ slug: 'umari' });
    if (!restaurant) {
      console.error('No se encontró el restaurante con slug "umari"');
      process.exit(1);
    }
    console.log(`Restaurante encontrado: ${restaurant.name} (${restaurant._id})`);

    // Update categories
    await Restaurant.findByIdAndUpdate(restaurant._id, { categories: CATEGORIES });
    console.log('Categorías actualizadas');

    // Remove existing products for this restaurant and insert new ones
    await Product.deleteMany({ restaurantId: restaurant._id });
    console.log('Productos anteriores eliminados');

    const toInsert = PRODUCTS.map(p => ({ ...p, restaurantId: restaurant._id }));
    await Product.insertMany(toInsert);
    console.log(`${toInsert.length} productos insertados`);

    console.log('¡Seed de Umarí completado!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();
