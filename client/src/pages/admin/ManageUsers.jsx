import { useEffect, useState } from 'react';
import { getAllUsers } from '../../services/api';
import Icon from '../../components/ui/Icon';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.district || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.blood_group === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="page-container text-center text-slate-600 py-20">Loading...</div>;

  return (
    <div className="page-container">
      <h1 className="section-title inline-flex items-center gap-2">
        <Icon name="users" size={24} className="text-primary-400" />
        Manage Users
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input className="input-field flex-1" placeholder="Search by name, email, or district..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500 mb-4">{filtered.length} users found</p>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d7dfd2] text-left">
                <th className="px-4 py-3 text-slate-600 font-medium">Name</th>
                <th className="px-4 py-3 text-slate-600 font-medium">Email</th>
                <th className="px-4 py-3 text-slate-600 font-medium">Phone</th>
                <th className="px-4 py-3 text-slate-600 font-medium">Blood</th>
                <th className="px-4 py-3 text-slate-600 font-medium">District</th>
                <th className="px-4 py-3 text-slate-600 font-medium">Available</th>
                <th className="px-4 py-3 text-slate-600 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[#e4ebdf] hover:bg-[#f1f6eb] transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.phone || '-'}</td>
                  <td className="px-4 py-3">{u.blood_group ? <span className="badge bg-danger-500/20 text-danger-400 border border-danger-500/30">{u.blood_group}</span> : '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{u.district || '-'}</td>
                  <td className="px-4 py-3">{u.available_to_donate ? <span className="badge-active">Yes</span> : <span className="badge-expired">No</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : u.role === 'hospital' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#eff4e9] text-slate-600 border border-[#d7dfd2]'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

