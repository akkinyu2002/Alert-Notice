import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createEmergencyAlert, getEmergencyAlerts } from '../services/api';
import { playAlertSound } from '../utils/sound';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TYPE_OPTIONS = [
  { value: 'fire', label: 'Fire', icon: 'fire' },
  { value: 'flood', label: 'Flood', icon: 'wave' },
  { value: 'earthquake', label: 'Earthquake', icon: 'quake' },
  { value: 'landslide', label: 'Landslide', icon: 'mountain' },
  { value: 'road_blockage', label: 'Road Blockage', icon: 'road' },
  { value: 'public_danger', label: 'Public Danger', icon: 'warning' },
  { value: 'other', label: 'Blood Need or Other Concern', icon: 'blood' },
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const QUICK_PRESETS = [
  {
    title: 'Urgent blood needed',
    description: 'Blood needed urgently in this area. Please inform donors and nearby responders.',
    type: 'other',
    severity: 'high',
  },
  {
    title: 'Flood risk nearby',
    description: 'Water level is rising quickly. Please alert nearby people and local authorities.',
    type: 'flood',
    severity: 'critical',
  },
  {
    title: 'Public safety concern',
    description: 'A local safety issue needs immediate attention from officials and nearby citizens.',
    type: 'public_danger',
    severity: 'high',
  },
];

const DEMO_LIST_LIMIT = 2;
const MAX_ALERT_IMAGE_MB = 3;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return <Marker position={position} />;
}

function badgeTone(severity) {
  const map = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return map[severity] || map.low;
}

export default function SendAlert() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'public_danger',
    severity: 'high',
    radius_km: 8,
    latitude: 27.7172,
    longitude: 85.324,
    expires_at: '',
  });
  const [position, setPosition] = useState([27.7172, 85.324]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proofImageData, setProofImageData] = useState('');
  const [proofImagePreview, setProofImagePreview] = useState('');

  const expiryHint = useMemo(() => {
    const date = form.expires_at ? new Date(form.expires_at) : new Date(Date.now() + 3 * 60 * 60 * 1000);
    return date.toLocaleString();
  }, [form.expires_at]);

  useEffect(() => {
    getEmergencyAlerts()
      .then((res) => setRecentAlerts((res.data || []).slice(0, DEMO_LIST_LIMIT)))
      .catch(() => {})
      .finally(() => setLoadingAlerts(false));
  }, []);

  const setCoordinates = (lat, lng) => {
    setPosition([lat, lng]);
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('This device cannot provide location. Please select location on map.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (coords) => {
        setError('');
        setCoordinates(coords.coords.latitude, coords.coords.longitude);
      },
      () => setError('Could not fetch location. Please pick the place on map.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const applyPreset = (preset) => {
    setSuccess('');
    setError('');
    setForm((prev) => ({
      ...prev,
      title: preset.title,
      description: preset.description,
      type: preset.type,
      severity: preset.severity,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProofImageData('');
      setProofImagePreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_ALERT_IMAGE_MB * 1024 * 1024) {
      setError(`Image too large. Max size is ${MAX_ALERT_IMAGE_MB}MB.`);
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setError('');
      setProofImageData(dataUrl);
      setProofImagePreview(dataUrl);
    } catch (_) {
      setError('Could not read image file. Please try another image.');
      event.target.value = '';
    }
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      title: '',
      description: '',
      type: 'public_danger',
      severity: 'high',
      radius_km: 8,
      expires_at: '',
    }));
    setProofImageData('');
    setProofImagePreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const expiresAt = form.expires_at ? new Date(form.expires_at).toISOString() : new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

      const response = await createEmergencyAlert({
        title: form.title.trim(),
        description: form.description.trim(),
        image_data: proofImageData || null,
        type: form.type,
        severity: form.severity,
        radius_km: Number(form.radius_km),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        expires_at: expiresAt,
        broadcast_to_towers: true,
      });

      const notified = response?.data?.notifiedCount ?? 0;
      const towerStatus = response?.data?.towerBroadcast?.sent ? 'Cell tower broadcast sent.' : 'Cell tower broadcast queued.';
      setSuccess(`Alert sent successfully. ${notified} nearby app users matched. ${towerStatus}`);
      playAlertSound('alert');
      resetForm();
      getEmergencyAlerts()
        .then((res) => setRecentAlerts((res.data || []).slice(0, DEMO_LIST_LIMIT)))
        .catch(() => {});
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send alert. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <section className="surface-elevated p-4 sm:p-6 lg:p-7">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-subtle p-5 sm:p-6 lg:p-7">
            <span className="tag-soft">No Login Required</span>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Send an emergency alert in seconds.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Report flood, blood need, fire, accident, or any public concern. The system notifies nearby users, cell towers in range, and response authorities.
            </p>

            <div className="mt-5 space-y-2">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left rounded-2xl border border-[#d5e5db] bg-white px-4 py-3 hover:bg-[#eff7f2] transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{preset.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{preset.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#d5e5db] bg-white px-4 py-3 text-xs text-slate-600">
              <p>Default expiry: about 3 hours from now ({expiryHint})</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d5e5db] bg-white p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Alert Details</h2>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title *</label>
                <input
                  className="input-field"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Example: Flood risk near Riverside area"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Tell responders and nearby people what is happening."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Attach Proof Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP up to {MAX_ALERT_IMAGE_MB}MB</p>
                {proofImagePreview && (
                  <img
                    src={proofImagePreview}
                    alt="Alert proof preview"
                    className="mt-2 h-28 w-full rounded-xl border border-[#d5e5db] object-cover"
                  />
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Concern Type *</label>
                  <select className="input-field" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
                    {TYPE_OPTIONS.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Severity *</label>
                  <select className="input-field" value={form.severity} onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value }))}>
                    {SEVERITY_OPTIONS.map((severity) => (
                      <option key={severity.value} value={severity.value}>
                        {severity.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Reach Radius (km)</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={form.radius_km}
                    onChange={(event) => setForm((prev) => ({ ...prev, radius_km: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Optional Expiry</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={form.expires_at}
                    onChange={(event) => setForm((prev) => ({ ...prev, expires_at: event.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-danger w-full text-base py-3 inline-flex items-center justify-center">
                {submitting ? 'Sending Alert...' : 'Send Alert Now'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-[#d5e5db] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Pin Incident Location</h3>
              <button type="button" onClick={useCurrentLocation} className="btn-ghost text-xs px-3 py-1.5">
                Use My Current Location
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#d5e5db]" style={{ height: '280px' }}>
              <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM contributors" />
                <LocationPicker
                  position={position}
                  onPick={(newPosition) => {
                    setCoordinates(newPosition[0], newPosition[1]);
                  }}
                />
                <Circle center={position} radius={Number(form.radius_km || 1) * 1000} pathOptions={{ color: '#e11d48', fillOpacity: 0.1 }} />
              </MapContainer>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Latitude: {Number(form.latitude).toFixed(5)} | Longitude: {Number(form.longitude).toFixed(5)}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#d5e5db] bg-[#f7fcf9] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
              <Link to="/emergency-alerts" className="text-sm font-semibold link-accent">
                View all
              </Link>
            </div>

            {loadingAlerts ? (
              <p className="text-sm text-slate-600">Loading active alerts...</p>
            ) : recentAlerts.length === 0 ? (
              <p className="text-sm text-slate-600">No active alerts yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-[#d5e5db] bg-white px-3 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                        {alert.image_url && (
                          <img
                            src={alert.image_url}
                            alt={`Evidence for ${alert.title}`}
                            className="mt-1.5 h-24 w-full rounded-lg border border-[#d5e5db] object-cover"
                          />
                        )}
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.description || 'Emergency alert submitted.'}</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeTone(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{alert.radius_km}km radius</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
