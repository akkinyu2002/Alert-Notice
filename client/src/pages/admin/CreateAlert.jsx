import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmergencyAlert } from '../../services/api';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { playAlertSound } from '../../utils/sound';

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CreateAlert() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'flood',
    severity: 'high',
    radius_km: 10,
    latitude: 27.7172,
    longitude: 85.324,
    expires_at: '',
    broadcast_to_towers: true,
    tower_ids_text: '',
  });
  const [position, setPosition] = useState([27.7172, 85.324]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePositionChange = (pos) => {
    setPosition(pos);
    setForm({ ...form, latitude: pos[0], longitude: pos[1] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const expiresAt = form.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const towerIds = form.tower_ids_text
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      await createEmergencyAlert({
        title: form.title,
        description: form.description,
        type: form.type,
        severity: form.severity,
        radius_km: form.radius_km,
        latitude: form.latitude,
        longitude: form.longitude,
        expires_at: expiresAt,
        broadcast_to_towers: form.broadcast_to_towers,
        tower_ids: towerIds,
      });
      playAlertSound('alert');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <h1 className="section-title">Create Emergency Alert</h1>

      <div className="glass-card p-8 animate-fade-in">
        {error && <div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 mb-4 text-danger-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title *</label>
            <input className="input-field" placeholder="e.g. Flood Warning - Bagmati River" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
            <textarea className="input-field" rows={3} placeholder="Describe the emergency..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Type *</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="flood">Flood</option>
                <option value="fire">Fire</option>
                <option value="earthquake">Earthquake</option>
                <option value="road_blockage">Road Blockage</option>
                <option value="landslide">Landslide</option>
                <option value="public_danger">Public Danger</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Severity *</label>
              <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Radius (km)</label>
              <input type="number" className="input-field" value={form.radius_km} onChange={(e) => setForm({ ...form, radius_km: parseFloat(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Expiry Date</label>
            <input type="datetime-local" className="input-field" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          </div>

          <div className="space-y-3 rounded-xl border border-[#d7dfd2] bg-[#f8faf6] p-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Broadcast to mobile towers</span>
              <input
                type="checkbox"
                checked={form.broadcast_to_towers}
                onChange={(e) => setForm({ ...form, broadcast_to_towers: e.target.checked })}
                className="h-4 w-4 accent-primary-500"
              />
            </label>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Tower IDs (comma-separated, optional)</label>
              <input
                className="input-field text-sm"
                placeholder="TOWER-KTM-01, TOWER-KTM-02"
                value={form.tower_ids_text}
                onChange={(e) => setForm({ ...form, tower_ids_text: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-2">
                If left empty, provider can select towers using latitude/longitude + radius.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-3 block">Click on map to set location</label>
            <div className="rounded-xl overflow-hidden" style={{ height: '300px' }}>
              <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
                <LocationPicker position={position} setPosition={handlePositionChange} />
                {position && <Circle center={position} radius={form.radius_km * 1000} pathOptions={{ color: '#ef4444', fillOpacity: 0.1 }} />}
              </MapContainer>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Lat: {form.latitude.toFixed(4)}, Lng: {form.longitude.toFixed(4)}
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-danger w-full text-lg py-3 inline-flex items-center justify-center">
            {loading ? 'Creating...' : 'Create Emergency Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}

