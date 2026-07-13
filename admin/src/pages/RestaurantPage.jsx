import { useState, useEffect } from 'react';
import api from '../api';
import BrandSection from '../components/restaurant/BrandSection';
import InfoSection from '../components/restaurant/InfoSection';
import PaymentMethodsSection from '../components/restaurant/PaymentMethodsSection';
import FulfillmentSection from '../components/restaurant/FulfillmentSection';

const TABS = [
  { key: 'brand',   label: 'Marca',        Component: BrandSection },
  { key: 'info',    label: 'Información',  Component: InfoSection },
  { key: 'payment', label: 'Pagos',        Component: PaymentMethodsSection },
  { key: 'ship',    label: 'Envío',        Component: FulfillmentSection },
];

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState(TABS[0].key);

  useEffect(() => {
    api.get('/api/admin/restaurant')
      .then(({ data }) => setRestaurant(data))
      .catch(() => setError('Error al cargar datos del restaurante'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="loading-text">Cargando...</p></div>;
  if (error)   return <div className="page"><p className="form-error">{error}</p></div>;

  const ActiveComponent = TABS.find((t) => t.key === activeTab).Component;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Mi local</h2>
      </div>

      <div className="section-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`section-tab ${activeTab === key ? 'section-tab--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <ActiveComponent restaurant={restaurant} onSaved={setRestaurant} />
    </div>
  );
}
