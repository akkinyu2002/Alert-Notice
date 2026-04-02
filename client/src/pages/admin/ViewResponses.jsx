import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResponsesForRequest, getBloodRequestById } from '../../services/api';
import Icon from '../../components/ui/Icon';

export default function ViewResponses() {
  const { requestId } = useParams();
  const [responses, setResponses] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getResponsesForRequest(requestId), getBloodRequestById(requestId)])
      .then(([resResp, reqResp]) => {
        setResponses(resResp.data);
        setRequest(reqResp.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) return <div className="page-container text-center text-slate-600 py-20">Loading...</div>;

  return (
    <div className="page-container max-w-4xl">
      <Link to="/admin" className="text-primary-400 hover:text-primary-300 text-sm mb-4 inline-block">
        Back to Dashboard
      </Link>

      {request && (
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{request.hospital_name}</h1>
              <p className="text-slate-600">
                Blood Request - {request.blood_group} - {request.units_needed} unit(s)
              </p>
            </div>
            <span className={`badge text-lg px-4 py-1 ${request.urgency === 'critical' ? 'badge-critical' : request.urgency === 'urgent' ? 'badge-urgent' : 'badge-active'}`}>
              {request.urgency}
            </span>
          </div>
        </div>
      )}

      <h2 className="section-title">Donor Responses ({responses.length})</h2>

      {responses.length === 0 && <div className="glass-card p-8 text-center text-slate-600">No responses yet.</div>}

      <div className="space-y-3">
        {responses.map((r, i) => (
          <div
            key={r.id}
            className={`glass-card p-5 flex items-center justify-between animate-fade-in ${
              r.response_status === 'willing' ? 'border-l-4 border-l-success-500' : 'border-l-4 border-l-gray-500'
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">{r.name?.charAt(0)}</div>
              <div>
                <p className="text-slate-900 font-medium">{r.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="phone" size={12} />
                    {r.phone || 'N/A'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="blood" size={12} />
                    {r.blood_group}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="location" size={12} />
                    {r.district || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={r.response_status === 'willing' ? 'badge-active inline-flex items-center gap-1' : 'badge-expired inline-flex items-center gap-1'}>
                <Icon name={r.response_status === 'willing' ? 'check' : 'xmark'} size={12} />
                {r.response_status === 'willing' ? 'Willing' : 'Unavailable'}
              </span>
              <p className="text-xs text-slate-500 mt-1">{new Date(r.responded_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

