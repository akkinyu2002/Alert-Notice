import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBloodRequests, getEmergencyAlerts, getUserStats } from '../services/api';

const featuredConcerns = [
  {
    title: 'Fire, accidents, or public danger',
    detail: 'One clear report can alert nearby people and response teams immediately.',
    tone: 'from-[#1f7660] to-[#2a8d73]',
    size: 'md:col-span-4',
  },
  {
    title: 'Urgent blood needs',
    detail: 'Hospitals can publish requests and get donor responses fast, in one place.',
    tone: 'from-[#c04f4f] to-[#ab3f3f]',
    size: 'md:col-span-2',
  },
  {
    title: 'Flood, landslide, road blockage',
    detail: 'Area-level reporting helps people avoid danger zones before it gets worse.',
    tone: 'from-[#246f75] to-[#2f8389]',
    size: 'md:col-span-3',
  },
  {
    title: 'Local community incidents',
    detail: 'From suspicious activity to neighborhood risk, report it without friction.',
    tone: 'from-[#4d7a60] to-[#5f8a6f]',
    size: 'md:col-span-3',
  },
];

const realFlow = [
  {
    step: '01',
    title: 'Citizen sends a short alert',
    text: 'No complicated form. Just location, issue type, and a useful summary.',
  },
  {
    step: '02',
    title: 'Nearby people are informed first',
    text: 'People close to the area get visibility early, so they can stay safe or help.',
  },
  {
    step: '03',
    title: 'Authority channels are triggered',
    text: 'The same report can move through official workflow without duplicating effort.',
  },
];

const testimonials = [
  {
    quote: 'We used this during a midnight road blockage. The response was faster than calling around manually.',
    name: 'S. Khadka',
    role: 'Community Volunteer, Lalitpur',
  },
  {
    quote: 'Our blood request got willing donors in under an hour. That changed how we handle urgent cases.',
    name: 'Bir Hospital Team',
    role: 'Emergency Desk',
  },
  {
    quote: 'What I like is the clarity. Alerts are short, local, and actually useful when time matters.',
    name: 'R. Shrestha',
    role: 'Citizen User, Kathmandu',
  },
];

const DEMO_LIST_LIMIT = 2;

function severityTone(severity) {
  const map = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
  return map[severity] || map.low;
}

function urgencyTone(urgency) {
  const map = {
    critical: 'badge-critical',
    urgent: 'badge-urgent',
    normal: 'badge-active',
  };
  return map[urgency] || map.normal;
}

export default function Home() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getEmergencyAlerts()
      .then((r) => setAlerts((r.data || []).slice(0, DEMO_LIST_LIMIT)))
      .catch(() => {});

    getBloodRequests()
      .then((r) => setBloodRequests((r.data || []).slice(0, DEMO_LIST_LIMIT)))
      .catch(() => {});

    if (user) {
      getUserStats()
        .then((r) => setStats(r.data))
        .catch(() => {});
    }
  }, [user]);

  const snapshot = useMemo(
    () => [
      { label: 'Active emergency alerts', value: stats?.activeAlerts ?? alerts.length },
      { label: 'Open blood requests', value: stats?.activeBloodRequests ?? bloodRequests.length },
      { label: 'Available donors', value: stats?.availableDonors ?? 'Live after login' },
    ],
    [alerts.length, bloodRequests.length, stats]
  );

  return (
    <div className="min-h-screen bg-transparent pb-16">
      <div className="page-container pt-6 space-y-6">
        <section className="surface-elevated p-5 sm:p-7 lg:p-8 overflow-hidden relative">
          <div className="pointer-events-none absolute -top-20 -left-16 h-44 w-44 rounded-full bg-[#c6ebd9]/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-2 h-56 w-56 rounded-full bg-[#d4eee1]/50 blur-3xl" />

          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-5 items-start relative">
            <div className="space-y-5">
              <p className="tag-soft">Built for real emergencies, not demo screens</p>
              <h1 className="text-4xl sm:text-5xl leading-[1.07] max-w-2xl">
                A calmer way to report urgent situations and reach the right people quickly.
              </h1>
              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                Nepal Alert helps citizens, hospitals, and response teams coordinate faster. Send one clear alert, and the system handles the routing.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link to="/send-alert" className="btn-primary px-6 py-3">
                  Report an Incident
                </Link>
                <Link to="/blood-requests" className="btn-ghost px-6 py-3">
                  View Blood Requests
                </Link>
              </div>

              <p className="text-xs text-slate-500 max-w-md">
                Public alert posting is available without login. Accounts unlock profile-based targeting and personalized feeds.
              </p>
            </div>

            <aside className="surface-subtle p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Live Snapshot</p>
                  <h2 className="text-2xl mt-1">Network right now</h2>
                </div>
                <span className="tag-soft mt-1">{user ? 'Connected' : 'Public Mode'}</span>
              </div>

              <div className="mt-4 space-y-2.5">
                {snapshot.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#d4e5da] bg-white px-3.5 py-3 flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-600">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[#d6e5dc] bg-[#f7fcf9] p-3.5">
                <p className="text-sm font-semibold text-slate-800">Trusted by local responders and hospital teams</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Designed for quick communication in stressful moments, with clear and local-first details.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="surface-elevated p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="tag-soft">What people actually report</p>
              <h2 className="text-3xl mt-2">Featured alert use cases</h2>
            </div>
            <Link to="/send-alert" className="link-accent text-sm font-semibold">
              Open alert form
            </Link>
          </div>

          <div className="grid md:grid-cols-6 gap-3">
            {featuredConcerns.map((item) => (
              <article
                key={item.title}
                className={`${item.size} rounded-2xl overflow-hidden border border-[#d6e6dc] bg-white`}
              >
                <div className={`h-2 bg-gradient-to-r ${item.tone}`} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.08fr_0.92fr] gap-4">
          <div className="surface-elevated p-5 sm:p-6">
            <p className="tag-soft">How the workflow works in practice</p>
            <h2 className="text-3xl mt-2">From report to response in three clear steps</h2>
            <div className="mt-4 space-y-3">
              {realFlow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[#d7e6dd] bg-[#f7fcf9] p-4"
                >
                  <p className="text-xs tracking-[0.12em] uppercase text-slate-500">{item.step}</p>
                  <h3 className="text-lg mt-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-1.5">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-elevated p-5 sm:p-6">
            <p className="tag-soft">Trust signals</p>
            <h2 className="text-2xl mt-2">Built with local safety teams in mind</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Chitwan'].map((city) => (
                <div key={city} className="rounded-xl border border-[#d6e5dc] bg-[#f8fcfa] px-3 py-2.5 text-sm text-slate-700">
                  {city}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              Pilot usage started with local administrators and hospital desks before opening broader public reporting.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="surface-elevated p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-2xl">Recent emergencies</h2>
              <Link to="/emergency-alerts" className="text-sm font-semibold link-accent">
                Full feed
              </Link>
            </div>
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-600">No active emergency alerts right now.</p>
            ) : (
              <div className="space-y-2.5">
                {alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-[#d7e5dc] bg-[#f7fcf9] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                        {alert.image_url && (
                          <img
                            src={alert.image_url}
                            alt={`Evidence for ${alert.title}`}
                            className="mt-1.5 h-24 w-full rounded-lg border border-[#d5e5db] object-cover"
                          />
                        )}
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.description || 'Emergency alert submitted.'}</p>
                      </div>
                      <span className={`badge ${severityTone(alert.severity)}`}>{alert.severity}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{alert.radius_km}km radius</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface-elevated p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-2xl">Open blood requests</h2>
              <Link to="/blood-requests" className="text-sm font-semibold link-accent">
                See all
              </Link>
            </div>
            {bloodRequests.length === 0 ? (
              <p className="text-sm text-slate-600">No active blood requests right now.</p>
            ) : (
              <div className="space-y-2.5">
                {bloodRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-[#d7e5dc] bg-[#f7fcf9] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{request.hospital_name}</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          {request.units_needed} unit(s) needed • {request.blood_group}
                        </p>
                      </div>
                      <span className={`badge ${urgencyTone(request.urgency)}`}>{request.urgency}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{request.contact_number}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="surface-elevated p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="tag-soft">Community voices</p>
              <h2 className="text-3xl mt-2">What users say after real incidents</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {testimonials.slice(0, DEMO_LIST_LIMIT).map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-[#d8e6dd] bg-[#f8fcfa] p-4"
              >
                <p className="text-sm text-slate-700 leading-relaxed">"{item.quote}"</p>
                <p className="text-sm font-semibold text-slate-900 mt-4">{item.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-elevated p-6 sm:p-7">
          <div className="grid md:grid-cols-[1.12fr_0.88fr] gap-5 items-start">
            <div>
              <p className="tag-soft">Our story</p>
              <h2 className="text-3xl mt-2">We built this because urgent communication was too fragmented.</h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-2xl">
                In many emergencies, the issue is not willingness to help. It is coordination. Nepal Alert was designed to reduce friction between citizens, hospitals, and response teams with one practical workflow.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d5e5db] bg-[#f7fcf9] p-4 sm:p-5">
              <p className="text-xs tracking-[0.12em] uppercase text-slate-500">Ready to use it?</p>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">Start with one report. Keep it short. Keep it local. We handle the routing.</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link to="/send-alert" className="btn-primary px-4 py-2.5">
                  Start an Alert
                </Link>
                <Link to="/emergency-alerts" className="btn-ghost px-4 py-2.5">
                  Browse Live Alerts
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
