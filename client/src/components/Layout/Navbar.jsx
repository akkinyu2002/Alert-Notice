import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/send-alert', label: 'Send Alert' },
  { to: '/emergency-alerts', label: 'Emergencies' },
  { to: '/blood-requests', label: 'Blood Requests' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/create-alert', label: 'Create Alert' },
  { to: '/admin/create-blood-request', label: 'Blood Request' },
  { to: '/admin/users', label: 'Users' },
];

const navTabBaseClass =
  'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition-colors';
const adminTabBaseClass =
  'inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors';
const mobileTabBaseClass = 'flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors';

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

  const linkTone = (path, isAdminLink = false) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);
    if (active) return 'border border-[#cfe1d7] bg-white text-[#14553f] shadow-[0_2px_8px_rgba(20,85,63,0.08)]';
    return isAdminLink ? 'text-slate-500 hover:text-slate-900 hover:bg-white/80' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80';
  };

  const linkClass = (path, isAdminLink = false) => {
    const base = isAdminLink ? adminTabBaseClass : navTabBaseClass;
    return `${base} ${linkTone(path, isAdminLink)}`;
  };

  const mobileLinkClass = (path, isAdminLink = false) => {
    return `${mobileTabBaseClass} ${linkTone(path, isAdminLink)}`;
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
          <div className="grid min-h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#d7f2e5] text-[#155741] flex items-center justify-center border border-[#b7dfcd] text-[11px] font-bold tracking-wide">
                NA
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">Nepal Alert</p>
                <p className="text-[11px] text-slate-500">Citizen Safety Network</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center justify-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center justify-end gap-2">
              {user && isAdmin ? (
                <>
                  <Link to="/profile" className="inline-flex items-center gap-2 rounded-full border border-[#cde0d4] bg-[#f6fbf8] px-3 py-1.5 hover:bg-[#ebf7f0] transition-colors">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d7f2e5] text-[#1f5d45] text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                    <span className="max-w-[120px] truncate text-sm text-slate-700">{user.name}</span>
                  </Link>
                  <div className="hidden xl:inline-flex items-center gap-1 rounded-full border border-[#cde0d4] bg-[#f6fbf8] p-1">
                    {adminLinks.map((link) => (
                      <Link key={link.to} to={link.to} className={linkClass(link.to, true)}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center rounded-full border border-[#cde0d4] bg-white px-3 text-sm font-medium text-slate-700 hover:bg-[#e9f6ef] transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to={adminEntryPath} className="inline-flex h-9 items-center rounded-full bg-[#177f62] px-4 text-sm font-semibold text-white hover:bg-[#14654f] transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden inline-flex h-10 min-w-[80px] px-3 items-center justify-center rounded-xl border border-[#cde0d4] text-slate-700 hover:bg-[#e9f6ef] text-sm font-semibold"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? 'Close' : 'Menu'}
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
                    className={mobileLinkClass(link.to)}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="my-2 border-t border-[#d2e3d8]"></div>
                    <p className="px-3 text-[11px] uppercase tracking-wide font-semibold text-slate-500">Admin</p>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={mobileLinkClass(link.to, true)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}

                <div className="my-2 border-t border-[#d2e3d8]"></div>
                {user && isAdmin ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#e9f6ef]"
                    >
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
                  <Link to={adminEntryPath} onClick={() => setMobileOpen(false)} className="w-full inline-flex items-center justify-center rounded-xl bg-[#177f62] px-3 py-2 text-sm font-semibold text-white">
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
