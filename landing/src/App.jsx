import { useState, useCallback } from 'react';
import {
  ShoppingCart, MessageCircle, BarChart2,
  Pencil, Zap, Globe, Lock, RefreshCw,
  Check, ArrowRight, Smartphone
} from 'lucide-react';
import SplashScreen from './components/SplashScreen';

const DEMO_URL = 'https://umari.pedi.uy/';
const WA_LINK = "https://wa.me/59899566170?text=Hola%2C%20deseo%20tener%20mi%20local%20en%20pedi.uy";

/* Brand ------------------------------------------------------------------ */
function Bubble({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M12 10h40a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H30l-12 10v-10h-6a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6Z" fill="#F2A31A" />
      <path d="M28 20v24M28 20c-3 0-5 2-5 6s2 5 5 5M36 20v9c0 2 1 3 3 3s3-1 3-3v-9M39 20v24" stroke="#141210" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Wordmark({ size = '26px', color = 'var(--dark)' }) {
  return (
    <span className="wordmark" style={{ fontSize: size, color }}>
      ped<span className="wordmark-i">&#305;<span className="wordmark-acc" /></span>
    </span>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <a href="#" className="nav-brand">
        <Bubble size={32} />
        <Wordmark size="26px" />
      </a>
      <a href={WA_LINK} target="_blank" rel="noreferrer" className="nav-cta">
        <MessageCircle size={16} /> Contactar
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-badge"><Zap size={13} /> Tu menú en la web</div>
          <h1 className="hero-title">
            Pedidos online para tu negocio, <span>sin comisiones, sin app.</span>
          </h1>
          <p className="hero-sub">
            Creá tu catálogo digital y tus clientes te piden directo por WhatsApp.
            Vos lo gestionás todo desde un panel simple.
          </p>
          <div className="hero-actions">
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={19} /> Quiero mi local
            </a>
            <a href="#demo" className="btn-ghost">
              <Smartphone size={18} /> Ver demo
            </a>
          </div>
          <div className="hero-trust">
            <span><Check size={16} /> Sin comisiones por venta</span>
            <span><Check size={16} /> Sin apps que instalar</span>
            <span><Check size={16} /> Listo en minutos</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-notch"><div className="phone-notch-pill" /></div>
            <div className="phone-screen">
              <div className="phone-header">
                <div className="phone-header-logo">🍕</div>
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
      </div>
    </section>
  );
}

function Marquee() {
  const items = 'Sin comisiones • Pedidos por WhatsApp • Carta digital propia • Panel de gestión • Sin apps • Historial de ventas • ';
  return (
    <div className="marquee">
      <div className="marquee-track">
        <span>{items.repeat(2)}</span>
        <span>{items.repeat(2)}</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: '1', title: 'Creá tu cuenta', desc: 'Registrá tu local en minutos: nombre, rubro y datos de contacto. Sin pasos técnicos.' },
    { n: '2', title: 'Armá tu carta digital', desc: 'Cargá tus productos, precios, fotos y variantes desde el panel, a tu ritmo.' },
    { n: '3', title: 'Recibís pedidos por WhatsApp', desc: 'Compartís el link de tu carta y tus clientes te envían el pedido directo a tu WhatsApp.' },
    { n: '4', title: 'Gestionás desde el panel', desc: 'Actualizás estados, notificás al cliente y llevás el historial desde el backoffice.' },
  ];
  return (
    <section className="section" id="como">
      <div className="section-center">
        <p className="section-label">Cómo funciona</p>
        <h2 className="section-title">Tené tu menú en la web en simples pasos</h2>
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
          <h2 className="section-title">Todo lo que necesitás para vender online</h2>
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
        <h2 className="section-title">Elegí cómo recibir tus pedidos</h2>
        <p className="section-sub">Dos modos según el tamaño y ritmo de tu negocio.</p>
      </div>
      <div className="receive-grid">
        <div className="receive-card">
          <div className="receive-card-header">
            <div className="receive-icon"><MessageCircle size={24} /></div>
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
            <div className="receive-icon receive-icon--accent"><BarChart2 size={24} /></div>
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
            <li><Check size={14} /> Notificación automática al cliente</li>
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
    <div className="demo-strip" id="demo">
      <h2>Probá la experiencia en vivo</h2>
      <p>Así va a ver tu menú digital cualquier cliente desde su celular.</p>
      <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn-dark">
        <Smartphone size={18} /> Abrir demo <ArrowRight size={16} />
      </a>
    </div>
  );
}

function Contact() {
  return (
    <div id="contacto">
      <section className="section">
        <div className="contact-wrap">
          <p className="section-label">Contacto</p>
          <h2 className="section-title">Quiero mi local</h2>
          <p className="section-sub" style={{ margin: '0 auto 1.5rem' }}>
            Escribinos por WhatsApp y en minutos tenés tu carta digital funcionando.
          </p>
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn-primary" style={{ marginTop: 8 }}>
            <MessageCircle size={20} /> Contactar por WhatsApp
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
        <Wordmark size="24px" color="#fff" />
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
      <Marquee />
      <HowItWorks />
      <Features />
      <HowToReceive />
      <DemoStrip />
      <Contact />
      <Footer />
    </>
  );
}
