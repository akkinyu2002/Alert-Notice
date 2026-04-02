import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { register as registerApi } from '../services/api';
import Icon from '../components/ui/Icon';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal', 'Biratnagar', 'Birgunj', 'Chitwan', 'Dharan', 'Nepalgunj'];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    blood_group: '',
    age: '',
    district: '',
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerApi({ ...form, age: form.age ? parseInt(form.age, 10) : null });
      loginUser(res.data.user, res.data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setError('Could not get location. Using default (Kathmandu).')
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#def5ea] via-[#eef8f3] to-[#d3ecdf]"></div>
      <div className="relative glass-card p-8 w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-[0_10px_24px_rgba(20,101,79,0.25)]">
            <Icon name="heart" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join Nepal Alert</h1>
          <p className="text-slate-600 text-sm mt-1">Register as a donor and stay informed</p>
        </div>

        {error && <div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 mb-4 text-danger-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</label>
              <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email *</label>
              <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password *</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone</label>
              <input className="input-field" placeholder="98XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Age</label>
              <input type="number" className="input-field" placeholder="25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
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
              <select className="input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option value="">Select</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" onClick={getLocation} className="btn-ghost w-full text-sm py-2 inline-flex items-center justify-center gap-2">
            <Icon name="location" size={16} />
            Use My Current Location
          </button>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

