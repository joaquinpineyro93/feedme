require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Restaurant = require('./models/Restaurant');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedme';

const products = [
  {
    name: 'Burger Clásica',
    description: 'Medallón de carne, lechuga, tomate, cheddar',
    price: 1500,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  },
  {
    name: 'Burger Doble',
    description: 'Doble medallón, bacon, cheddar doble',
    price: 2200,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
  },
  {
    name: 'Burger Veggie',
    description: 'Medallón de garbanzos, rúcula, tomate, mostaza',
    price: 1600,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
  },
  {
    name: 'Papas Fritas',
    description: 'Papas doradas con sal',
    price: 800,
    category: 'Acompañamientos',
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop',
  },
  {
    name: 'Papas con Cheddar',
    description: 'Papas con salsa cheddar casera',
    price: 1100,
    category: 'Acompañamientos',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop',
  },
  {
    name: 'Coca-Cola 500ml',
    description: 'Bien fría',
    price: 600,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop',
  },
  {
    name: 'Agua Mineral',
    description: 'Sin gas',
    price: 400,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
  },
  {
    name: 'Helado Casero',
    description: 'Vainilla o chocolate, 2 bochas',
    price: 900,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1567206563114-c179706a56b0?w=400&h=300&fit=crop',
  },
];

const restaurantData = {
  name: 'Burger Bros',
  phone: '+59898478604',
  address: 'Av. Corrientes 1234, Buenos Aires',
  description: 'Las mejores hamburguesas artesanales de la ciudad',
  openHours: 'Lun-Dom: 12:00 - 00:00',
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    await Product.deleteMany({});
    await Restaurant.deleteMany({});
    console.log('Colecciones limpiadas');

    await Product.insertMany(products);
    console.log(`${products.length} productos insertados`);

    await Restaurant.create(restaurantData);
    console.log('Restaurante creado');

    console.log('Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();
