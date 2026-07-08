import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Bubble from '../components/Bubble';
import Wordmark from '../components/Wordmark';

// Registro deshabilitado temporalmente: el único alta de local es vía WhatsApp.
const REGISTER_ENABLED = false;

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Completá todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (mode === 'register' && REGISTER_ENABLED) await register(username, password);
      else await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split">

        {/* Brand panel */}
        <div className="login-brand">
          <div className="login-brand-inner">
            <div className="login-brand-icon">
              <Bubble size={52} />
            </div>
            <div className="login-brand-name"><Wordmark size="1em" color="#fff" /></div>
            <div className="login-brand-tag">admin</div>
            <p className="login-brand-sub">Gestioná tu local desde un solo lugar</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            <h2 className="login-form-title">Bienvenido</h2>
            <p className="login-form-sub">Ingresá con tu usuario y contraseña</p>

            {REGISTER_ENABLED && (
              <div className="login-tabs">
                <button
                  className={`login-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => { setMode('login'); setError(''); }}
                >
                  Iniciar sesión
                </button>
                <button
                  className={`login-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => { setMode('register'); setError(''); }}
                >
                  Registrarse
                </button>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: admin"
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Cargando...' : mode === 'register' && REGISTER_ENABLED ? 'Crear cuenta' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
