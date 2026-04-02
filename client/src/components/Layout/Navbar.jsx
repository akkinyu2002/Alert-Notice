import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../ui/Icon';

const navLinks = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/send-alert', label: 'Send Alert', icon: 'alert' },
  { to: '/emergency-alerts', label: 'Emergencies', icon: 'alert' },
  { to: '/blood-requests', label: 'Blood Requests', icon: 'blood' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/create-alert', label: 'Create Alert', icon: 'plus' },
  { to: '/admin/create-blood-request', label: 'Blood Request', icon: 'blood' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDetached, setIsDetached] = useState(false);
  const adminEntryPath = user && isAdmin ? '/admin' : '/admin/login';

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    const onScroll = () => {
      setIsDetached(window.scrollY > 14);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const linkClass = (path, isAdminLink = false) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);
    if (active) return 'bg-[#d9f0e4] text-[#14553f] shadow-[inset_0_0_0_1px_rgba(20,85,63,0.08)]';
    return isAdminLink
      ? 'text-slate-500 hover:text-slate-900 hover:bg-[#e9f6ef]'
      : 'text-slate-600 hover:text-slate-900 hover:bg-[#e9f6ef]';
  };

  return (
    <nav className={`sticky top-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isDetached ? 'pt-4' : 'pt-0'}`}>
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 ${
          isDetached
            ? 'rounded-2xl border border-[#c8ddd1] bg-white/95 backdrop-blur shadow-[0_14px_40px_rgba(17,88,65,0.14)]'
            : 'rounded-none border-b border-[#d4e6dc] bg-[#eef7f1]/95 backdrop-blur-sm shadow-none'
        }`}
      >
        <div className="px-3 sm:px-4">
          <div className="flex items-center justify-between min-h-[64px] gap-2">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#d7f2e5] text-[#155741] flex items-center justify-center border border-[#b7dfcd]">
                <Icon name="alert" size={17} />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">Nepal Alert</p>
                <p className="text-[11px] text-slate-500">Citizen Safety Network</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${linkClass(link.to)}`}
                >
                  <Icon name={link.icon} size={14} />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {user && isAdmin ? (
                <>
                  <Link to="/profile" className="inline-flex items-center gap-2 rounded-full border border-[#cde0d4] bg-[#f6fbf8] px-3 py-1.5 hover:bg-[#ebf7f0] transition-colors">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d7f2e5] text-[#1f5d45] text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-700 max-w-[120px] truncate">{user.name}</span>
                  </Link>
                  {isAdmin && (
                    <div className="hidden xl:flex items-center gap-1 rounded-full border border-[#cde0d4] bg-[#f6fbf8] px-2 py-1">
                      {adminLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${linkClass(link.to, true)}`}
                        >
                          <Icon name={link.icon} size={12} />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-full border border-[#cde0d4] bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-[#e9f6ef] transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to={adminEntryPath} className="inline-flex items-center rounded-full bg-[#177f62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14654f] transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#cde0d4] text-slate-600 hover:bg-[#e9f6ef]"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
            </button>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 animate-fade-in">
              <div className="rounded-2xl border border-[#d2e3d8] bg-[#f7fcf9] p-2 space-y-1 shadow-[0_10px_30px_rgba(17,88,65,0.1)]">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${linkClass(link.to)}`}
                  >
                    <Icon name={link.icon} size={14} />
                    {link.label}
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="border-t border-[#d2e3d8] my-2"></div>
                    <p className="px-3 text-[11px] uppercase tracking-wide font-semibold text-slate-500">Admin</p>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${linkClass(link.to, true)}`}
                      >
                        <Icon name={link.icon} size={14} />
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}

                <div className="border-t border-[#d2e3d8] my-2"></div>
                {user && isAdmin ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#e9f6ef]"
                    >
                      <Icon name="user" size={14} />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#e9f6ef]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to={adminEntryPath}
                    onClick={() => setMobileOpen(false)}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-[#177f62] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
