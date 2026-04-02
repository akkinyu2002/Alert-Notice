import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBloodRequests } from '../services/api';
import Icon from '../components/ui/Icon';

const urgencyConfig = {
  critical: { class: 'badge-critical', bg: 'border-l-danger-500' },
  urgent: { class: 'badge-urgent', bg: 'border-l-orange-500' },
  normal: { class: 'badge-active', bg: 'border-l-success-500' },
};

export default function BloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBloodRequests()
      .then((r) => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container text-center text-slate-600 py-20">Loading...</div>;

  return (
    <div className="page-container">
      <h1 className="section-title inline-flex items-center gap-2">
        <Icon name="blood" size={24} className="text-danger-400" />
        Blood Requests
      </h1>

      {requests.length === 0 && <div className="glass-card p-12 text-center text-slate-600">No active blood requests right now.</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req, i) => (
          <Link
            key={req.id}
            to={`/blood-requests/${req.id}`}
            className={`glass-card-hover p-5 border-l-4 ${urgencyConfig[req.urgency]?.bg || 'border-l-gray-500'} animate-fade-in`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={urgencyConfig[req.urgency]?.class || 'badge-active'}>{req.urgency}</span>
              <div className="w-12 h-12 rounded-xl bg-danger-500/15 border border-danger-500/25 flex items-center justify-center text-danger-500 font-bold text-lg">
                {req.blood_group}
              </div>
            </div>
            <h3 className="text-slate-900 font-semibold text-lg mb-1">{req.hospital_name}</h3>
            <p className="text-sm text-slate-600 mb-3">{req.units_needed} unit(s) needed</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p className="inline-flex items-center gap-1">
                <Icon name="phone" size={13} />
                {req.contact_number}
              </p>
              <p className="inline-flex items-center gap-1">
                <Icon name="location" size={13} />
                {req.radius_km}km radius
              </p>
              <p className="inline-flex items-center gap-1">
                <Icon name="clock" size={13} />
                Expires: {new Date(req.expires_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#dde9e1]">
              <span className="text-xs text-success-400 inline-flex items-center gap-1">
                <Icon name="check" size={13} />
                {req.willing_count || 0} willing
              </span>
              <span className="text-xs text-slate-500">{req.total_responses || 0} total responses</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

