import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBloodRequestById, respondToBloodRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function BloodRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [responded, setResponded] = useState(false);
  const [responseStatus, setResponseStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBloodRequestById(id)
      .then((r) => setRequest(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleRespond = async (status) => {
    if (!user) {
      alert('Donor response requires an authenticated account.');
      return;
    }

    try {
      await respondToBloodRequest({ request_id: parseInt(id, 10), response_status: status });
      setResponded(true);
      setResponseStatus(status);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to respond');
    }
  };

  if (loading) return <div className="page-container text-center text-slate-600 py-20">Loading...</div>;
  if (!request) return <div className="page-container text-center text-slate-600 py-20">Request not found</div>;

  return (
    <div className="page-container max-w-4xl">
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`badge ${request.urgency === 'critical' ? 'badge-critical' : request.urgency === 'urgent' ? 'badge-urgent' : 'badge-active'}`}>
                {request.urgency}
              </span>
              <span className="badge-active">Active</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{request.hospital_name}</h1>
            <p className="text-slate-600 mt-1">Blood donation request</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-danger-500/20 border-2 border-danger-500/40 flex items-center justify-center text-danger-400 font-bold text-3xl">
            {request.blood_group}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#f8faf6] rounded-xl p-4">
            <p className="text-sm text-slate-600">Units Needed</p>
            <p className="text-xl font-bold text-slate-900">{request.units_needed}</p>
          </div>
          <div className="bg-[#f8faf6] rounded-xl p-4">
            <p className="text-sm text-slate-600">Contact</p>
            <a href={`tel:${request.contact_number}`} className="text-xl font-bold text-primary-500 hover:text-primary-600">{request.contact_number}</a>
          </div>
          <div className="bg-[#f8faf6] rounded-xl p-4">
            <p className="text-sm text-slate-600">Radius</p>
            <p className="text-xl font-bold text-slate-900">{request.radius_km} km</p>
          </div>
          <div className="bg-[#f8faf6] rounded-xl p-4">
            <p className="text-sm text-slate-600">Expires</p>
            <p className="text-xl font-bold text-slate-900">{new Date(request.expires_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden mb-6" style={{ height: '300px' }}>
          <MapContainer center={[request.latitude, request.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
            <Marker position={[request.latitude, request.longitude]}>
              <Popup>{request.hospital_name}</Popup>
            </Marker>
            <Circle center={[request.latitude, request.longitude]} radius={request.radius_km * 1000} pathOptions={{ color: '#ef4444', fillOpacity: 0.1 }} />
          </MapContainer>
        </div>

        {responded ? (
          <div className={`rounded-xl p-6 text-center ${responseStatus === 'willing' ? 'bg-success-500/10 border border-success-500/20' : 'bg-gray-500/10 border border-gray-500/20'}`}>
            <p className="text-lg font-semibold text-slate-900">
              {responseStatus === 'willing'
                ? 'Thank you. Your willingness to donate has been recorded.'
                : 'Your response has been recorded.'}
            </p>
            <p className="text-sm text-slate-600 mt-2">The hospital will contact you if needed.</p>
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-[#dce4d6] bg-[#f8faf6] p-5">
            <p className="text-sm text-slate-600 mb-3">
              Public users can view this request directly. To respond as a donor, sign in with an authorized account.
            </p>
            <a href={`tel:${request.contact_number}`} className="btn-primary w-full text-lg py-4 text-center inline-flex items-center justify-center">
              Call Hospital
            </a>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => handleRespond('willing')} className="btn-success flex-1 text-lg py-4 inline-flex items-center justify-center">
              I Can Donate
            </button>
            <button onClick={() => handleRespond('unavailable')} className="btn-ghost flex-1 text-lg py-4 inline-flex items-center justify-center">
              Not Available
            </button>
            <a href={`tel:${request.contact_number}`} className="btn-primary flex-1 text-lg py-4 text-center inline-flex items-center justify-center">
              Call Hospital
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

