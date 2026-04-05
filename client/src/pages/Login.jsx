import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../services/api';

export default function Login({ adminOnly = false }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      const isPrivileged = res.data.user.role === 'admin' || res.data.user.role === 'hospital';

      if (adminOnly && !isPrivileged) {
        setError('Only admin or hospital accounts can sign in here.');
        return;
      }

      loginUser(res.data.user, res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#dff5eb] via-[#eef8f3] to-[#d3ecdf]"></div>
      <div className="relative glass-card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-[0_10px_24px_rgba(20,101,79,0.25)] text-xs font-bold tracking-[0.12em]">
            AL
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{adminOnly ? 'Admin Sign In' : 'Welcome Back'}</h1>
          <p className="text-slate-600 text-sm mt-1">
            {adminOnly ? 'Admin panel access for operations and maintenance' : 'Login to Nepal Alert System'}
          </p>
        </div>

        {error && <div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 mb-4 text-danger-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {adminOnly ? (
          <p className="text-center text-sm text-slate-600 mt-6">
            Public users can send alerts directly from the home page without login.
          </p>
        ) : (
          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Register
            </Link>
          </p>
        )}

        <div className="mt-6 border-t border-[#d7dfd2] pt-4">
          <p className="text-xs text-slate-500 text-center mb-2">Test Accounts</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {(adminOnly
              ? [
                  { label: 'Admin', email: 'admin@alert.np', pass: 'admin123' },
                  { label: 'Hospital', email: 'bir@hospital.np', pass: 'admin123' },
                ]
              : [
                  { label: 'Admin', email: 'admin@alert.np', pass: 'admin123' },
                  { label: 'Hospital', email: 'bir@hospital.np', pass: 'admin123' },
                ]
            ).map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setForm({ email: acc.email, password: acc.pass })}
                className="text-left px-3 py-2 rounded-lg bg-[#f8faf6] hover:bg-[#eef4e7] transition-colors text-slate-600 hover:text-slate-900"
              >
                <span className="font-medium text-slate-700">{acc.label}:</span> {acc.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

