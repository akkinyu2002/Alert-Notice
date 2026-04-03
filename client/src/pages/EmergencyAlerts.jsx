import { useEffect, useState } from 'react';
import { getEmergencyAlerts } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const severityColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const typeIcons = {
  flood: 'wave',
  fire: 'fire',
  earthquake: 'quake',
  road_blockage: 'road',
  landslide: 'mountain',
  public_danger: 'warning',
  other: 'megaphone',
};

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [view, setView] = useState('cards');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmergencyAlerts()
      .then((r) => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container text-center text-slate-600 py-20">Loading alerts...</div>;

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title mb-0">Emergency Alerts</h1>
        <div className="inline-flex items-center rounded-xl border border-[#d0e2d7] bg-white p-1 shadow-sm">
          <button
            onClick={() => setView('cards')}
            className={`min-w-[84px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'cards' ? 'bg-[#dff2e8] text-[#124f3d]' : 'text-slate-600 hover:text-slate-900 hover:bg-[#edf8f3]'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setView('map')}
            className={`min-w-[84px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'map' ? 'bg-[#dff2e8] text-[#124f3d]' : 'text-slate-600 hover:text-slate-900 hover:bg-[#edf8f3]'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {alerts.length === 0 && <div className="glass-card p-12 text-center text-slate-600">No active emergency alerts. Stay safe.</div>}

      {view === 'cards' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert, i) => (
            <div key={alert.id} className="glass-card-hover p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">{typeIcons[alert.type] || 'other'}</span>
                  <span className={`badge ${alert.severity === 'critical' ? 'badge-critical' : alert.severity === 'high' ? 'badge-high' : alert.severity === 'medium' ? 'badge-medium' : 'badge-low'}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="badge bg-[#f7fcf9] text-slate-600 border border-[#d3e4da]">{alert.type.replace('_', ' ')}</span>
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">{alert.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{alert.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#dfe9e2] pt-3">
                <span>{alert.radius_km}km radius</span>
                <span>Expires: {new Date(alert.expires_at).toLocaleDateString()}</span>
              </div>
              {alert.created_by_name && <p className="text-xs text-slate-500 mt-2">Created by: {alert.created_by_name}</p>}
            </div>
          ))}
        </div>
      )}

      {view === 'map' && alerts.length > 0 && (
        <div className="glass-card overflow-hidden" style={{ height: '500px' }}>
          <MapContainer center={[alerts[0].latitude, alerts[0].longitude]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
            {alerts.map((alert) => (
              <span key={alert.id}>
                <Circle
                  center={[alert.latitude, alert.longitude]}
                  radius={alert.radius_km * 1000}
                  pathOptions={{ color: severityColors[alert.severity], fillOpacity: 0.15 }}
                />
                <Marker position={[alert.latitude, alert.longitude]}>
                  <Popup>
                    <strong>{alert.title}</strong>
                    <br />
                    Severity: {alert.severity}
                    <br />
                    Radius: {alert.radius_km}km
                  </Popup>
                </Marker>
              </span>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

