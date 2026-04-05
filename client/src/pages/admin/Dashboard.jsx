import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserStats, getAllEmergencyAlerts, getAllBloodRequests } from '../../services/api';

const DEMO_LIST_LIMIT = 2;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [bloodReqs, setBloodReqs] = useState([]);

  useEffect(() => {
    getUserStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
    getAllEmergencyAlerts()
      .then((r) => setAlerts(r.data.slice(0, DEMO_LIST_LIMIT)))
      .catch(() => {});
    getAllBloodRequests()
      .then((r) => setBloodReqs(r.data.slice(0, DEMO_LIST_LIMIT)))
      .catch(() => {});
  }, []);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">System overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/create-alert" className="btn-danger inline-flex items-center">
            New Alert
          </Link>
          <Link to="/admin/create-blood-request" className="btn-primary inline-flex items-center">
            New Blood Request
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: 'from-[#2f9f87] to-[#1f7f68]' },
            { label: 'Available Donors', value: stats.availableDonors, color: 'from-[#2faf72] to-[#228f5d]' },
            { label: 'Active Alerts', value: stats.activeAlerts, color: 'from-[#f14545] to-[#d93737]' },
            { label: 'Blood Requests', value: stats.activeBloodRequests, color: 'from-[#df6868] to-[#bf4b4b]' },
            { label: 'Donor Responses', value: stats.totalResponses, color: 'from-[#43a08a] to-[#2f7c67]' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 text-white text-xs font-bold`}>
                {s.label.charAt(0)}
              </div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {stats?.bloodGroupStats && (
        <div className="glass-card p-6 mb-8 animate-fade-in">
          <h3 className="text-slate-900 font-semibold mb-4">Blood Group Distribution</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
              const stat = stats.bloodGroupStats.find((s) => s.blood_group === bg);
              return (
                <div key={bg} className="text-center p-3 rounded-xl bg-[#f7fcf9] border border-[#d9e7df]">
                  <p className="text-lg font-bold text-danger-400">{bg}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat?.count || 0}</p>
                  <p className="text-xs text-slate-500">donors</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-semibold">Recent Emergency Alerts</h3>
            <Link to="/admin/create-alert" className="text-xs link-accent inline-flex items-center">Create</Link>
          </div>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f7fcf9] border border-[#d9e7df]">
                <div>
                  <p className="text-slate-900 text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.type} - {a.radius_km}km
                  </p>
                </div>
                <span className={`badge ${a.severity === 'critical' ? 'badge-critical' : a.severity === 'high' ? 'badge-high' : 'badge-medium'}`}>{a.severity}</span>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-slate-500">No alerts yet</p>}
          </div>
        </div>

        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-semibold">Recent Blood Requests</h3>
            <Link to="/admin/create-blood-request" className="text-xs link-accent inline-flex items-center">Create</Link>
          </div>
          <div className="space-y-3">
            {bloodReqs.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f7fcf9] border border-[#d9e7df]">
                <div>
                  <p className="text-slate-900 text-sm font-medium">{r.hospital_name}</p>
                  <p className="text-xs text-slate-500">
                    {r.units_needed} units - {r.willing_count || 0} willing
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-danger-400 font-bold text-sm">{r.blood_group}</span>
                  <Link to={`/admin/responses/${r.id}`} className="text-xs link-accent">
                    View
                  </Link>
                </div>
              </div>
            ))}
            {bloodReqs.length === 0 && <p className="text-sm text-slate-500">No requests yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

