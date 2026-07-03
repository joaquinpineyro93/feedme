import { useState, useCallback } from 'react';
import {
  UtensilsCrossed, ShoppingCart, MessageCircle, BarChart2,
  Pencil, Zap, Globe, Lock, RefreshCw,
  Check, ArrowRight, Smartphone
} from 'lucide-react';
import SplashScreen from './components/SplashScreen';

const DEMO_URL = 'http://localhost:5173';
const WA_LINK = "https://wa.me/59899566170?text=Hola%2C%20deseo%20tener%20mi%20local%20en%20pedi.uy";

function Nav() {
  return (
    <nav className="nav">
      <a href="#" className="nav-brand">
        <div className="nav-brand-icon">
          <UtensilsCrossed size={18} color="#111827" />
        </div>
        <span className="nav-brand-name">Pedi</span>
      </a>
      <a href={WA_LINK} target="_blank" rel="noreferrer" className="nav-cta">Contactar</a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero">

      <div className="hero-badge">
        <Zap size={12} /> Tu menú en la web
      </div>
      <h1 className="hero-title">
        Pedidos online para tu negocio<br />
        <span>sin comisiones, sin app</span>
      </h1>
      <p className="hero-sub">
        Crea tu catalogo digital y tus clientes te piden directo por WhatsApp.
        Vos lo gestionás todo desde un panel simple.
      </p>
      <div className="hero-actions">
        <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn-primary">
          <MessageCircle size={18} /> Contactar
        </a>
      </div>

      <div className="hero-visual">
        <div className="phone-mockup">
          <div className="phone-notch"><div className="phone-notch-pill" /></div>
          <div className="phone-screen">
            <div className="phone-header">
              <div className="phone-header-logo">
                <UtensilsCrossed size={13} color="#111827" />
              </div>
              <div>
                <div className="phone-header-name">La Pizzería</div>
                <div className="phone-header-sub">Las mejores pizzas</div>
              </div>
            </div>
            <div className="phone-product-card">
              <img
                className="phone-product-img"
                src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=200&fit=crop"
                alt="Pizza"
              />
              <div className="phone-product-body">
                <div className="phone-product-name">Pizza Clásica</div>
                <div className="phone-product-desc">Salsa, mozzarella, albahaca fresca</div>
                <div className="phone-product-footer">
                  <span className="phone-product-price">$1.500</span>
                  <span className="phone-add-btn">+ Agregar</span>
                </div>
              </div>
            </div>
            <div className="phone-cart-bar">
              <span className="phone-cart-text">Ver pedido · 2 items</span>
              <span className="phone-cart-text">$3.200 →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '1', title: 'Escribinos por WhatsApp', desc: 'Mandanos un mensaje contándonos tu negocio: nombre del local, rubro y qué productos querés ofrecer. Te respondemos enseguida.' },
    { n: '2', title: 'Armamos tu carta digital', desc: 'En menos de 24 hs tenés tu catálogo online listo para compartir con tus clientes.' },
    { n: '3', title: 'Recibís pedidos por WhatsApp', desc: 'Tus clientes eligen del menú y te envían el pedido directo a tu WhatsApp.' },
    { n: '4', title: 'Gestionás desde el panel', desc: 'Actualizás estados, notificás al cliente y llevás el historial desde el backoffice.' },
  ];
  return (
    <section className="section">
      <div className="section-center">
        <p className="section-label">Cómo funciona</p>
        <h2 className="section-title">Tené tu menú en la web<br />en simples pasos</h2>
        <p className="section-sub">Sin instalaciones, sin aprendizaje técnico. Solo compartís el link y empezás a recibir pedidos.</p>
      </div>
      <div className="steps-grid">
        {steps.map(s => (
          <div className="step-card" key={s.n}>
            <div className="step-number">{s.n}</div>
            <div className="step-title">{s.title}</div>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const list = [
    { icon: <Globe size={20} />, title: 'Carta digital propia', desc: 'URL personalizada para tu local, sin apps que instalar.' },
    { icon: <MessageCircle size={20} />, title: 'Pedidos por WhatsApp', desc: 'El mensaje llega listo, formateado, directo a tu número.' },
    { icon: <BarChart2 size={20} />, title: 'Panel de gestión', desc: 'Seguí cada pedido, marcá estados y notificá al cliente.' },
    { icon: <Pencil size={20} />, title: 'Editor de productos', desc: 'Agregá, editá o desactivás productos en cualquier momento.' },
    { icon: <RefreshCw size={20} />, title: 'Historial de pedidos', desc: 'Filtrá por fechas y analizá las ventas de tu negocio.' },
    { icon: <Lock size={20} />, title: 'Acceso seguro', desc: 'Panel protegido con usuario y contraseña para tu equipo.' },
    { icon: <ShoppingCart size={20} />, title: 'Carrito inteligente', desc: 'Tus clientes arman su pedido con cantidades y variantes.' },
    { icon: <Zap size={20} />, title: 'Sin comisiones', desc: 'Pagás solo la suscripción. Cada venta es 100% tuya.' },
  ];
  return (
    <div className="features-bg">
      <section className="section">
        <div className="section-center">
          <p className="section-label">Funcionalidades</p>
          <h2 className="section-title">Todo lo que necesitás<br />para vender online</h2>
          <p className="section-sub">Sin complicaciones técnicas. Listo para usar desde el día uno.</p>
        </div>
        <div className="features-grid">
          {list.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HowToReceive() {
  return (
    <section className="section">
      <div className="section-center">
        <p className="section-label">Flexibilidad</p>
        <h2 className="section-title">Elegí cómo recibir<br />tus pedidos</h2>
        <p className="section-sub">Dos modos según el tamaño y ritmo de tu negocio.</p>
      </div>
      <div className="receive-grid">
        <div className="receive-card">
          <div className="receive-card-header">
            <div className="receive-icon">
              <MessageCircle size={24} />
            </div>
            <div>
              <div className="receive-title">Solo WhatsApp</div>
              <div className="receive-tag">Simple</div>
            </div>
          </div>
          <p className="receive-desc">
            Cada pedido llega a tu WhatsApp listo y formateado. Vos lo leés, lo preparás y respondés al cliente directamente desde el chat. Ideal para negocios chicos o que recién arrancan.
          </p>
          <ul className="receive-list">
            <li><Check size={14} /> Pedido llega al WhatsApp del local</li>
            <li><Check size={14} /> Mensaje pre-armado con detalle completo</li>
            <li><Check size={14} /> Sin pasos extra, sin panel</li>
          </ul>
        </div>

        <div className="receive-card receive-card--featured">
          <div className="receive-card-header">
            <div className="receive-icon receive-icon--accent">
              <BarChart2 size={24} />
            </div>
            <div>
              <div className="receive-title">WhatsApp + Panel de gestión</div>
              <div className="receive-tag receive-tag--accent">Completo</div>
            </div>
          </div>
          <p className="receive-desc">
            Además de recibir el pedido por WhatsApp, lo gestionás desde el backoffice: marcás estados, notificás al cliente cuando está listo y llevás el historial de todas tus ventas.
          </p>
          <ul className="receive-list">
            <li><Check size={14} /> Todo lo del modo Simple</li>
            <li><Check size={14} /> Panel con estado de cada pedido</li>
            <li><Check size={14} /> Notificación automática al cliente cuando está listo</li>
            <li><Check size={14} /> Historial con filtros por fecha</li>
            <li><Check size={14} /> Estadísticas de ventas</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function DemoStrip() {
  return (
    <div className="demo-strip">
      <h2>Probá la experiencia en vivo</h2>
      <p>Así va a ver tu menú digital cualquier cliente desde su celular.</p>
      <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn-primary">
        <Smartphone size={18} /> Abrir Demo <ArrowRight size={16} />
      </a>
    </div>
  );
}

function Pricing() {
  const free = [
    'Hasta 20 productos',
    'Panel de pedidos',
    'Gestión de categorías',
    'Historial básico (7 días)',
  ];
  const pro = [
    'Productos ilimitados',
    'Historial completo',
    'Notificaciones al cliente',
    'Logo y datos del local',
    'Soporte prioritario',
    'Onboarding personalizado',
  ];
  return (
    <section className="section section-center">
      <p className="section-label">Precios</p>
      <h2 className="section-title">Simple y transparente</h2>
      <p className="section-sub" style={{ margin: '0 auto' }}>
        Empezá gratis y escalá cuando estés listo.
      </p>
      <div className="pricing-grid">
        <div className="plan-card">
          <div className="plan-name">Gratis</div>
          <div className="plan-price">$0 <span>/ mes</span></div>
          <p className="plan-desc">Para probar la plataforma sin compromiso.</p>
          <ul className="plan-features">
            {free.map(f => <li key={f}><Check size={15} />{f}</li>)}
          </ul>
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="plan-cta outline">Contactar</a>
        </div>
        <div className="plan-card featured">
          <div className="plan-badge">Más popular</div>
          <div className="plan-name">Pro</div>
          <div className="plan-price">$25 <span>USD / mes</span></div>
          <p className="plan-desc">Todo lo que necesita un negocio en crecimiento.</p>
          <ul className="plan-features">
            {pro.map(f => <li key={f}><Check size={15} />{f}</li>)}
          </ul>
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="plan-cta">Contactar</a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <div id="contacto" className="contact-bg">
      <section className="section">
        <div className="contact-wrap">
          <p className="section-label">Contacto</p>
          <h2 className="section-title">Quiero mi local</h2>
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="form-submit" style={{ display: 'inline-flex', textDecoration: 'none', marginTop: 24 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.882l6.19-1.449A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.001-1.367l-.358-.214-3.724.872.931-3.613-.234-.372A9.79 9.79 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Contactar
          </a>
        </div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="footer-brand-icon">
          <UtensilsCrossed size={14} color="#111827" />
        </div>
        <span className="footer-brand-name">Pedi</span>
      </div>
      <p className="footer-tagline">Tu menú en la web &mdash; &copy; {new Date().getFullYear()} Pedi</p>
    </footer>
  );
}

export default function App() {
  const [splash, setSplash] = useState(true);
  const onSplashDone = useCallback(() => setSplash(false), []);

  return (
    <>
      {splash && <SplashScreen onDone={onSplashDone} />}
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <HowToReceive />

      <Contact />
      <Footer />
    </>
  );
}
