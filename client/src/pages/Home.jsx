import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmergencyAlerts, getBloodRequests, getUserStats } from '../services/api';
import Icon from '../components/ui/Icon';

const concernTiles = [
  {
    icon: 'alert',
    title: 'Emergency Incident',
    description: 'Fire, accidents, personal danger, or public safety concerns.',
  },
  {
    icon: 'blood',
    title: 'Urgent Blood Need',
    description: 'Fast donor matching with direct request response flow.',
  },
  {
    icon: 'wave',
    title: 'Flood and Weather',
    description: 'Area-level warning with quick government escalation.',
  },
  {
    icon: 'tower',
    title: 'Tower-Based Reach',
    description: 'Delivers alerts using nearby cell towers when GPS is off.',
  },
  {
    icon: 'road',
    title: 'Road and Transport',
    description: 'Road blockage, landslide, and route hazard reporting.',
  },
  {
    icon: 'megaphone',
    title: 'Community Concern',
    description: 'Any local issue that needs nearby people and officials informed.',
  },
];

const flowSteps = [
  {
    icon: 'note',
    title: 'Report in Seconds',
    description: 'Open the app, choose issue type, and submit with one clear message.',
  },
  {
    icon: 'building',
    title: 'Government + Nearby Receive',
    description: 'The system forwards alerts to response authorities and people close to the area.',
  },
  {
    icon: 'tower',
    title: 'Tower Coverage Fallback',
    description: 'If users do not share location, nearby towers can still carry the alert.',
  },
];

function severityTone(severity) {
  const map = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return map[severity] || map.low;
}

function urgencyTone(urgency) {
  const map = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    urgent: 'bg-orange-100 text-orange-700 border-orange-200',
    normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return map[urgency] || map.normal;
}

export default function Home() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    getEmergencyAlerts()
      .then((r) => setAlerts(r.data.slice(0, 3)))
      .catch(() => {});

    getBloodRequests()
      .then((r) => setBloodRequests(r.data.slice(0, 3)))
      .catch(() => {});

    getUserStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen bg-[#edf7ef] text-slate-900 pb-16">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="pointer-events-none absolute -top-8 -left-8 w-56 h-56 rounded-full bg-[#c7eed7]/45 blur-3xl"></div>
        <div className="pointer-events-none absolute top-24 right-4 w-64 h-64 rounded-full bg-[#d3f3e2]/40 blur-3xl"></div>

        <section className="relative rounded-[30px] border border-[#d6ddd1] bg-white p-4 sm:p-6 lg:p-7 shadow-[0_18px_50px_rgba(37,55,29,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] border border-[#dde4d7] bg-[#f7faf4] p-5 sm:p-6 lg:p-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#daf5e8] px-3 py-1 text-xs font-semibold text-[#1e6149]">
                <span className="h-2 w-2 rounded-full bg-[#1f946b]"></span>
                Fast Public Alert
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                Hassle-free emergency reporting for citizens, nearby people, and government.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                If someone is in trouble, they can send one alert for blood need, flood, accidents, or any local concern. The platform forwards it quickly to authorities and people close to the incident.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {!user ? (
                  <>
                    <Link to="/send-alert" className="inline-flex items-center gap-2 rounded-full bg-[#0e7b67] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a6253] transition-colors">
                      Send Alert Now
                      <Icon name="arrow" size={14} />
                    </Link>
                    <Link to="/register" className="inline-flex items-center gap-2 rounded-full border border-[#cfe0d6] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f2f8f3] transition-colors">
                      Create Account
                    </Link>
                    <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-[#cfd9cd] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f2f6ef] transition-colors">
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/send-alert" className="inline-flex items-center gap-2 rounded-full bg-[#0e7b67] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a6253] transition-colors">
                      Send Alert
                      <Icon name="arrow" size={14} />
                    </Link>
                    <Link to="/emergency-alerts" className="inline-flex items-center gap-2 rounded-full border border-[#cfd9cd] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f2f6ef] transition-colors">
                      View Emergency Alerts
                      <Icon name="arrow" size={14} />
                    </Link>
                    <Link to="/blood-requests" className="inline-flex items-center gap-2 rounded-full border border-[#cfd9cd] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f2f6ef] transition-colors">
                      Open Blood Requests
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#dde4d7] bg-white px-4 py-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#d9e9d1] text-[10px] font-bold text-[#3e5a34]"
                    >
                      {i}
                    </span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Alerts can reach both app users and tower coverage zones in the same area.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1b6654] via-[#22806a] to-[#2f9b83] p-5 sm:p-6 text-white">
              <div className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-white/20 blur-2xl"></div>
              <div className="absolute -bottom-8 left-8 h-28 w-28 rounded-full bg-[#bdeccd]/30 blur-2xl"></div>

              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Coverage Model</p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight">
                  Reach people near the incident,
                  <br />
                  even without shared GPS.
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  {[
                    { icon: 'location', label: 'Location-aware user targeting', detail: 'Nearest users in configured radius' },
                    { icon: 'tower', label: 'Cell tower fallback targeting', detail: 'Broadcast to nearby towers if needed' },
                    { icon: 'building', label: 'Government notification path', detail: 'Authority workflow from same alert' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white/12 border border-white/20 px-4 py-3 backdrop-blur">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Icon name={item.icon} size={16} className="text-[#d9f4b3]" />
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-white/75">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: 'building',
                title: 'Alert Government Fast',
                text: 'Same alert can be routed to authorized responders immediately.',
              },
              {
                icon: 'users',
                title: 'Notify Nearby Citizens',
                text: 'People in the impact zone receive the alert quickly.',
              },
              {
                icon: 'tower',
                title: 'Use Tower Coverage',
                text: 'Supports alerting when location sharing is disabled.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#dde4d7] bg-[#f9fbf7] px-4 py-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f4d5] text-[#2d6147]">
                    <Icon name={item.icon} size={15} />
                  </span>
                  {item.title}
                </p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d6ddd1] bg-white p-5 sm:p-6 shadow-[0_14px_40px_rgba(37,55,29,0.07)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Concern Categories</h2>
            <span className="inline-flex items-center rounded-full bg-[#d5ec9c] px-3 py-1 text-xs font-semibold text-[#355126]">
              Any issue, one report flow
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {concernTiles.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#dce4d6] bg-[#f8faf6] p-4 hover:bg-[#f2f7ec] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#d7e0d3] text-[#29614a]">
                    <Icon name={item.icon} size={17} />
                  </span>
                  <Icon name="arrow" size={13} className="text-slate-400" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d6ddd1] bg-white p-5 sm:p-6 shadow-[0_14px_40px_rgba(37,55,29,0.07)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Live Network Snapshot</h2>
            {user ? (
              <span className="inline-flex items-center rounded-full bg-[#e3f4d8] px-3 py-1 text-xs font-semibold text-[#2f6e45]">
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#edf2e9] px-3 py-1 text-xs font-semibold text-slate-600">
                Login for live numbers
              </span>
            )}
          </div>

          {user && stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Registered Donors', value: stats.totalUsers, icon: 'users' },
                { label: 'Available Donors', value: stats.availableDonors, icon: 'heart' },
                { label: 'Active Alerts', value: stats.activeAlerts, icon: 'alert' },
                { label: 'Blood Requests', value: stats.activeBloodRequests, icon: 'blood' },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-[#dce4d6] bg-[#f8faf6] p-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf6de] text-[#29614a]">
                    <Icon name={card.icon} size={16} />
                  </span>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-600">{card.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#dce4d6] bg-[#f8faf6] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-slate-600 max-w-2xl">
                Sign in to see active emergency counts, blood request load, and donor availability in real time.
              </p>
              <div className="flex items-center gap-2">
                <Link to="/login" className="inline-flex items-center rounded-full border border-[#cfd9cd] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#f2f6ef] transition-colors">
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center rounded-full bg-[#1f946b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#197657] transition-colors">
                  Register
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[26px] border border-[#d6ddd1] bg-white p-5 sm:p-6 shadow-[0_14px_40px_rgba(37,55,29,0.07)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2">
                <Icon name="alert" size={20} className="text-[#1f6b55]" />
                Recent Emergencies
              </h2>
              <Link to={user ? '/emergency-alerts' : '/login'} className="text-sm font-semibold text-[#1f7a61] hover:text-[#165a48]">
                View all
              </Link>
            </div>

            {user ? (
              alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="rounded-2xl border border-[#dce4d6] bg-[#f8faf6] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-2">{alert.description}</p>
                        </div>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${severityTone(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1">
                        <Icon name="location" size={12} />
                        {alert.radius_km}km range
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No active emergency alerts right now.</p>
              )
            ) : (
              <p className="text-sm text-slate-600">Login to view active emergency feed near you.</p>
            )}
          </div>

          <div className="rounded-[26px] border border-[#d6ddd1] bg-white p-5 sm:p-6 shadow-[0_14px_40px_rgba(37,55,29,0.07)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2">
                <Icon name="blood" size={20} className="text-[#1f6b55]" />
                Urgent Blood Requests
              </h2>
              <Link to={user ? '/blood-requests' : '/login'} className="text-sm font-semibold text-[#1f7a61] hover:text-[#165a48]">
                View all
              </Link>
            </div>

            {user ? (
              bloodRequests.length > 0 ? (
                <div className="space-y-3">
                  {bloodRequests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-[#dce4d6] bg-[#f8faf6] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{request.hospital_name}</h3>
                          <p className="mt-1 text-xs text-slate-600">
                            {request.units_needed} unit(s) needed - {request.blood_group}
                          </p>
                        </div>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${urgencyTone(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1">
                        <Icon name="phone" size={12} />
                        {request.contact_number}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No active blood requests right now.</p>
              )
            ) : (
              <p className="text-sm text-slate-600">Login to view and respond to blood requests.</p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d6ddd1] bg-white p-5 sm:p-6 shadow-[0_14px_40px_rgba(37,55,29,0.07)]">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">How It Works</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-[#dce4d6] bg-[#f8faf6] p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f4d5] text-[#2d6147]">
                    <Icon name={step.icon} size={15} />
                  </span>
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
