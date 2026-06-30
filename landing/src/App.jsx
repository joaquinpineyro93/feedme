import { useState } from 'react';
import {
  UtensilsCrossed, ShoppingCart, MessageCircle, BarChart2,
  Pencil, CheckCircle, Zap, Globe, Lock, RefreshCw, Send,
  Check, ArrowRight, Smartphone
} from 'lucide-react';

const DEMO_URL = 'http://localhost:5173';

function Nav() {
  return (
    <nav className="nav">
      <a href="#" className="nav-brand">
        <div className="nav-brand-icon">
          <UtensilsCrossed size={18} color="#111827" />
        </div>
        <span className="nav-brand-name">Pedi</span>
      </a>
      <a href="#contacto" className="nav-cta">Quiero mi local</a>
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
        Creamos tu catálogo digital y tus clientes te piden directo por WhatsApp.
        Vos lo gestionás todo desde un panel simple.
      </p>
      <div className="hero-actions">
        <a href="#contacto" className="btn-primary">
          <MessageCircle size={18} /> Quiero mi local
        </a>
        <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn-ghost">
          <Smartphone size={18} /> Ver demo en vivo
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
    { n: '1', title: 'Ponte en contacto con nosotros', desc: 'Completá el formulario de contacto o escribinos por WhatsApp. Contanos tu negocio: rubro, nombre del local y qué productos querés ofrecer.' },
    { n: '2', title: 'Armamos tu carta digital', desc: 'En menos de 24 hs tenés tu catálogo online listo para compartir con tus clientes.' },
    { n: '3', title: 'Recibís pedidos por WhatsApp', desc: 'Tus clientes eligen del menú y te envían el pedido directo a tu WhatsApp.' },
    { n: '4', title: 'Gestionás desde el panel', desc: 'Actualizás estados, notificás al cliente y llevás el historial desde el backoffice.' },
  ];
  return (
    <section className="section">
      <div className="section-center">
        <p className="section-label">Cómo funciona</p>
        <h2 className="section-title">De cero a pedidos<br />en menos de 24 horas</h2>
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
          <a href="#contacto" className="plan-cta outline">Empezar gratis</a>
        </div>
        <div className="plan-card featured">
          <div className="plan-badge">Más popular</div>
          <div className="plan-name">Pro</div>
          <div className="plan-price">$25 <span>USD / mes</span></div>
          <p className="plan-desc">Todo lo que necesita un negocio en crecimiento.</p>
          <ul className="plan-features">
            {pro.map(f => <li key={f}><Check size={15} />{f}</li>)}
          </ul>
          <a href="#contacto" className="plan-cta">Quiero el plan Pro</a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', business: '', phone: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.business.trim() || !form.phone.trim()) return;
    setLoading(true);
    const msg = [
      '---------------------------------',
      'Hola! Me interesa Pedi para mi negocio.',
      '---------------------------------',
      `*Nombre:* ${form.name}`,
      `*Local:* ${form.business}`,
      `*Telefono:* ${form.phone}`,
      '---------------------------------',
    ].join('\n');
    const waLink = `https://wa.me/59898478604?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
    setTimeout(() => { setLoading(false); setSent(true); }, 500);
  };

  return (
    <div id="contacto" className="contact-bg">
      <section className="section">
        <div className="contact-wrap">
          <p className="section-label">Contacto</p>
          <h2 className="section-title">Quiero mi local en Pedi</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Completá el formulario y te contactamos en menos de 24 hs para arrancar.
          </p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tu nombre</label>
              <input
                className="form-input"
                placeholder="Ej: María García"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de tu negocio</label>
              <input
                className="form-input"
                placeholder="Ej: La Pizzería de Juan"
                value={form.business}
                onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tu WhatsApp</label>
              <input
                className="form-input"
                type="tel"
                placeholder="Ej: +598 99 123 456"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
            <button className="form-submit" type="submit" disabled={loading || sent}>
              <Send size={16} />
              {sent ? 'Mensaje enviado!' : loading ? 'Abriendo WhatsApp...' : 'Enviar por WhatsApp'}
            </button>
            {sent && (
              <div className="form-success">
                <CheckCircle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Te vamos a responder en menos de 24 hs. Gracias!
              </div>
            )}
          </form>
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
  return (
    <>
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <HowToReceive />
      <DemoStrip />
      <Contact />
      <Footer />
    </>
  );
}
