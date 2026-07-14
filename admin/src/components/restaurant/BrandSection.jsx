import { useState, useRef } from 'react';
import api from '../../api';
import HeaderPreview from './HeaderPreview';

export default function BrandSection({ restaurant, onSaved }) {
  const [logo, setLogo]           = useState(restaurant.logo || '');
  const [heroImage, setHeroImage] = useState(restaurant.heroImage || '');
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const fileRef = useRef(null);
  const heroFileRef = useRef(null);

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.patch('/api/admin/restaurant', { logo, heroImage });
      onSaved(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="section-tab-wrap" onSubmit={handleSave}>
      <div className="section-tab-grid">
        <div className="section-card">
          <h3 className="section-card-title">Logo del local</h3>
          <div className="logo-upload-area" onClick={() => fileRef.current.click()}>
            {logo ? (
              <img src={logo} alt="Logo" className="logo-preview-img" />
            ) : (
              <div className="logo-upload-placeholder">
                <span className="logo-upload-icon">+</span>
                <span>Subir logo</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>JPG, PNG o SVG</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange(setLogo)}
          />
          {logo && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setLogo(''); fileRef.current.value = ''; }}
            >
              Quitar logo
            </button>
          )}
        </div>

        <div className="section-card">
          <h3 className="section-card-title">Imagen de portada</h3>
          <div className="logo-upload-area hero-upload-area" onClick={() => heroFileRef.current.click()}>
            {heroImage ? (
              <img src={heroImage} alt="Portada" className="hero-preview-img" />
            ) : (
              <div className="logo-upload-placeholder">
                <span className="logo-upload-icon">+</span>
                <span>Subir portada</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>JPG o PNG, apaisada</span>
              </div>
            )}
          </div>
          <input
            ref={heroFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange(setHeroImage)}
          />
          {heroImage && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setHeroImage(''); heroFileRef.current.value = ''; }}
            >
              Quitar portada
            </button>
          )}
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 20 }}>
        <h3 className="section-card-title">Vista previa</h3>
        <HeaderPreview
          name={restaurant.name}
          description={restaurant.description}
          logo={logo}
          heroImage={heroImage}
          openHours={restaurant.openHours}
          acceptingOrders={restaurant.acceptingOrders !== false}
        />
      </div>

      <div className="section-tab-save-bar">
        {error   && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Cambios guardados correctamente.</p>}
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
