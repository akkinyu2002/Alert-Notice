import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBloodRequest } from '../../services/api';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '../../components/ui/Icon';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CreateBloodRequest() {
  const [form, setForm] = useState({
    hospital_name: '',
    blood_group: 'A+',
    units_needed: 1,
    urgency: 'urgent',
    contact_number: '',
    radius_km: 5,
    latitude: 27.7172,
    longitude: 85.324,
    expires_at: '',
  });
  const [position, setPosition] = useState([27.7172, 85.324]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
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
      const expiresAt = form.expires_at || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const res = await createBloodRequest({ ...form, expires_at: expiresAt });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="page-container max-w-2xl">
        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-success-500/20 border border-success-500/30 text-success-400 flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Blood Request Created!</h2>
          <p className="text-slate-600 mb-4">{result.matchedDonors} matching donors have been notified.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setResult(null); setForm({ ...form, hospital_name: '', blood_group: 'A+', units_needed: 1 }); }} className="btn-primary">
              Create Another
            </button>
            <button onClick={() => navigate('/admin')} className="btn-ghost">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      <h1 className="section-title inline-flex items-center gap-2">
        <Icon name="blood" size={24} className="text-danger-400" />
        Create Blood Request
      </h1>
      <div className="glass-card p-8 animate-fade-in">
        {error && <div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 mb-4 text-danger-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Hospital Name *</label>
            <input className="input-field" placeholder="e.g. Bir Hospital" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Blood Group *</label>
              <select className="input-field" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Units Needed</label>
              <input type="number" min="1" className="input-field" value={form.units_needed} onChange={(e) => setForm({ ...form, units_needed: parseInt(e.target.value, 10) })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Urgency *</label>
              <select className="input-field" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Radius (km)</label>
              <input type="number" className="input-field" value={form.radius_km} onChange={(e) => setForm({ ...form, radius_km: parseFloat(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Contact Number *</label>
            <input className="input-field" placeholder="01-XXXXXXX" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} required />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Expiry Date</label>
            <input type="datetime-local" className="input-field" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-3 block inline-flex items-center gap-2">
              <Icon name="location" size={15} />
              Hospital Location (click map)
            </label>
            <div className="rounded-xl overflow-hidden" style={{ height: '300px' }}>
              <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
                <LocationPicker position={position} setPosition={handlePositionChange} />
                {position && <Circle center={position} radius={form.radius_km * 1000} pathOptions={{ color: '#3b82f6', fillOpacity: 0.1 }} />}
              </MapContainer>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-3 inline-flex items-center justify-center gap-2">
            <Icon name="blood" size={18} />
            {loading ? 'Creating...' : 'Create Blood Request and Notify Donors'}
          </button>
        </form>
      </div>
    </div>
  );
}

