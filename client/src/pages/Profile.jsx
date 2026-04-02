import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/api';
import Icon from '../components/ui/Icon';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        blood_group: user.blood_group || '',
        age: user.age || '',
        district: user.district || '',
        latitude: user.latitude || 27.7172,
        longitude: user.longitude || 85.324,
        last_donated_at: user.last_donated_at || '',
        available_to_donate: !!user.available_to_donate,
        receive_emergency_alerts: !!user.receive_emergency_alerts,
        receive_blood_alerts: !!user.receive_blood_alerts,
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await updateProfile(form);
      updateUser(res.data);
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setMessage('Could not get location.')
      );
    }
  };

  if (!user) return null;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title inline-flex items-center gap-2">
        <Icon name="user" size={24} className="text-primary-400" />
        My Profile
      </h1>
      <div className="glass-card p-8 animate-fade-in">
        {message && (
          <div className={`rounded-xl p-3 mb-4 text-sm ${message.includes('success') ? 'bg-success-500/10 border border-success-500/20 text-success-400' : 'bg-danger-500/10 border border-danger-500/20 text-danger-400'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone</label>
              <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Age</label>
              <input type="number" className="input-field" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Blood Group</label>
              <select className="input-field" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">District</label>
              <input className="input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Last Donated</label>
              <input type="date" className="input-field" value={form.last_donated_at} onChange={(e) => setForm({ ...form, last_donated_at: e.target.value })} />
            </div>
          </div>

          <button type="button" onClick={getLocation} className="btn-ghost w-full text-sm py-2 inline-flex items-center justify-center gap-2">
            <Icon name="location" size={16} />
            Update My Location
          </button>

          <div className="space-y-3 border-t border-[#d3e3d9] pt-4">
            <h3 className="text-slate-900 font-semibold">Preferences</h3>
            {[
              { key: 'available_to_donate', label: 'Available to Donate Blood', icon: 'heart' },
              { key: 'receive_emergency_alerts', label: 'Receive Emergency Alerts', icon: 'alert' },
              { key: 'receive_blood_alerts', label: 'Receive Blood Request Alerts', icon: 'blood' },
            ].map((toggle) => (
              <label key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-[#f7fcf9] border border-[#d5e5db] cursor-pointer hover:bg-[#eef8f3] transition-colors">
                <span className="text-sm text-slate-700 inline-flex items-center gap-2">
                  <Icon name={toggle.icon} size={14} className="text-slate-600" />
                  {toggle.label}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form[toggle.key] || false}
                    onChange={(e) => setForm({ ...form, [toggle.key]: e.target.checked })}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${form[toggle.key] ? 'bg-success-500' : 'bg-slate-500'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${form[toggle.key] ? 'translate-x-5.5 ml-[1px]' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

