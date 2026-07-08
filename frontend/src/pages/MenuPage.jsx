import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toZonedTime, format } from 'date-fns-tz';
import { Search, X, AlertTriangle, Star, RefreshCw, Calendar, ArrowUpDown, Check } from 'lucide-react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import SplashScreen from '../components/SplashScreen';
import { useCart } from '../context/CartContext';

const APP_TIMEZONE = 'America/Montevideo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Burger Clásica', description: 'Medallón de carne, lechuga, tomate, cheddar', price: 1500, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
  { _id: '2', name: 'Burger Doble', description: 'Doble medallón, bacon, cheddar doble', price: 2200, category: 'Burgers', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop' },
  { _id: '3', name: 'Burger Veggie', description: 'Medallón de garbanzos, rúcula, tomate, mostaza', price: 1600, category: 'Burgers', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop' },
  { _id: '4', name: 'Papas Fritas', description: 'Papas doradas con sal', price: 800, category: 'Acompañamientos', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop' },
  { _id: '5', name: 'Papas con Cheddar', description: 'Papas con salsa cheddar casera', price: 1100, category: 'Acompañamientos', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop' },
  { _id: '6', name: 'Coca-Cola 500ml', description: 'Bien fría', price: 600, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop' },
  { _id: '7', name: 'Agua Mineral', description: 'Sin gas', price: 400, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop' },
  { _id: '8', name: 'Helado Casero', description: 'Vainilla o chocolate, 2 bochas', price: 900, category: 'Postres', image: 'https://images.unsplash.com/photo-1567206563114-c179706a56b0?w=400&h=300&fit=crop' },
];

function getTodayMenus(products = []) {
  const nowInAppTz = toZonedTime(new Date(), APP_TIMEZONE);
  const todayDow  = nowInAppTz.getDay();
  const todayDate = format(nowInAppTz, 'yyyy-MM-dd', { timeZone: APP_TIMEZONE });

  return products.filter(p => {
    if (!p.isDaily || !p.dailyActive) return false;
    if (p.recurrence === 'weekly') return p.dayOfWeek === todayDow;
    if (p.recurrence === 'once')   return p.date === todayDate;
    return false;
  });
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [splash, setSplash] = useState(true);
  const [error, setError] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const { totalItems, totalPrice, setRestaurant: setCartRestaurant } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const subdomain = window.location.hostname.split('.')[0];
        const headers = subdomain && subdomain !== 'localhost' ? { 'X-Tenant': subdomain } : {};
        const [productsRes, restaurantRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { headers }),
          axios.get(`${API_URL}/api/restaurant`, { headers }),
        ]);
        setProducts(productsRes.data);
        setRestaurant(restaurantRes.data);
        setCartRestaurant(restaurantRes.data);
        setCategories(restaurantRes.data.categories || []);
        if (restaurantRes.data.name) document.title = `${restaurantRes.data.name} — Pedi`;
      } catch (err) {
        setProducts(MOCK_PRODUCTS);
        setCategories(['Burgers', 'Acompañamientos', 'Bebidas', 'Postres']);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const todayMenus = getTodayMenus(products).filter(m =>
    search === '' ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = products
    .filter(p => {
      if (p.isDaily) return false;
      const matchSearch = search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === '' || p.category === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });

  // Group by category — use restaurant categories order when available,
  // but always include products whose category isn't in the list yet.
  const knownCats = categories.length > 0 ? categories : [];
  const allCats = [
    ...knownCats,
    ...filtered.map(p => p.category).filter(c => c && !knownCats.includes(c)),
  ].filter((c, i, arr) => arr.indexOf(c) === i);

  const grouped = allCats.reduce((acc, cat) => {
    const catProducts = filtered.filter(p => p.category === cat);
    if (catProducts.length > 0) acc[cat] = catProducts;
    return acc;
  }, {});

  const onSplashDone = useCallback(() => setSplash(false), []);

  return (
    <>
    {splash && <SplashScreen onDone={onSplashDone} />}
    <div className="app-container">
      {!loading && <Header restaurant={restaurant} />}

      <div className="content-card">
      {/* Search + category filter */}
      <div className={`search-bar-wrapper${loading ? ' search-bar-wrapper--hidden' : ''}`}>
        <div className="search-sort-row">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
            )}
          </div>
          <div className="sort-dropdown-wrap" ref={sortRef}>
            <button className={`sort-icon-btn ${sortOrder ? 'sort-icon-btn--active' : ''}`} onClick={() => setSortOpen(o => !o)}>
              <ArrowUpDown size={16} />
            </button>
            {sortOpen && (
              <div className="sort-dropdown">
                {[{ value: '', label: 'Sin orden' }, { value: 'asc', label: 'Precio: menor a mayor' }, { value: 'desc', label: 'Precio: mayor a menor' }].map(opt => (
                  <button key={opt.value} className={`sort-option ${sortOrder === opt.value ? 'sort-option--active' : ''}`}
                    onClick={() => { setSortOrder(opt.value); setSortOpen(false); }}>
                    {sortOrder === opt.value && <Check size={13} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {categories.length > 0 && (
          <div className="cat-filter-scroll">
            <button
              className={`cat-filter-pill ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="main-content">
        {loading && (
          <div className="skeleton-menu">
            {[0,1,2].map(s => (
              <div key={s} className="skeleton-section">
                <div className="skeleton skeleton-category-title" />
                <div className="product-grid">
                  {[0,1,2,3].map(c => (
                    <div key={c} className="skeleton-card">
                      <div className="skeleton skeleton-card-img" />
                      <div className="skeleton-card-body">
                        <div className="skeleton skeleton-line skeleton-line--lg" />
                        <div className="skeleton skeleton-line skeleton-line--sm" />
                        <div className="skeleton skeleton-line skeleton-line--price" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="error-state">
            <AlertTriangle size={32} />
            <p>{error}</p>
          </div>
        )}

        {/* Menú del día */}
        {!loading && todayMenus.length > 0 && (
          <section className="menu-section">
            <h2 className="category-title category-title--daily">
              <Star size={14} className="category-title-star" /> Menú del día
            </h2>
            <div className="product-grid">
              {todayMenus.map(m => (
                <ProductCard
                  key={m._id}
                  product={m}
                  dailyBadge={m.recurrence === 'weekly'
                    ? <><RefreshCw size={10} /> Todos los {DAYS[m.dayOfWeek]}</>
                    : <><Calendar size={10} /> Solo hoy</>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && Object.keys(grouped).length === 0 && search && (
          <div className="empty-search">
            <p>No encontramos productos para "<strong>{search}</strong>"</p>
            <button className="btn-back" onClick={() => { setSearch(''); setActiveCategory(''); }}>Ver todo el menú</button>
          </div>
        )}

        {!loading && !error && Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="menu-section">
            <h2 className="category-title">{category}</h2>
            <div className="product-grid">
              {items.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ))}

        {!loading && !error && (
          <div className="powered-by-footer">
            <a href="https://pedi.uy" target="_blank" rel="noopener noreferrer">
              <span className="powered-by-label">Powered by</span>
              <span className="powered-by-wordmark">
                ped<span className="wordmark-i">&#305;<span className="wordmark-acc" /></span>
              </span>
            </a>
          </div>
        )}
      </main>
      </div>{/* /content-card */}

      {totalItems > 0 && (
        <button className="floating-cart" onClick={() => setCartOpen(true)}>
          <span className="floating-cart-text">Ver pedido</span>
          <span className="floating-cart-summary">{totalItems} · ${totalPrice.toLocaleString('es-AR')}</span>
        </button>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
    </>
  );
}
