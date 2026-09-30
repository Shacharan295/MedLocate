import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { Users, Search, Mail, Phone, Calendar, Shield } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        role: roleFilter !== 'ALL' ? roleFilter.toLowerCase() : undefined,
        search: searchTerm || undefined
      });
      setUsers(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit user registrations, role permissions, and dispensary linkages.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </form>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['ALL', 'PATIENT', 'PHARMACY', 'ADMIN'].map((tab) => (
          <button
            key={tab}
            onClick={() => setRoleFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              roleFilter === tab
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Retrieving registered user accounts..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are currently no accounts matching the specified filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Name & Email</th>
                  <th className="py-3.5 px-5">Phone</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Linked Pharmacy</th>
                  <th className="py-3.5 px-5 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <strong className="font-bold text-slate-900 block text-sm">
                        {u.name}
                      </strong>
                      <span className="text-slate-500 text-[11px]">{u.email}</span>
                    </td>

                    <td className="py-4 px-5 text-slate-700">{u.phone}</td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'pharmacy'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      {u.pharmacyId ? (
                        <div>
                          <strong className="text-slate-800 block">{u.pharmacyId.name}</strong>
                          <span className="text-slate-400 text-[10px]">
                            {u.pharmacyId.verified ? 'Verified Store' : 'Pending Verification'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
