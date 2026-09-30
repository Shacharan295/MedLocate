import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users,
  Store,
  ShieldCheck,
  ShieldAlert,
  Package,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getReports();
      setReports(res.data?.data);
    } catch (err) {
      setError('Failed to fetch system reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Administration & Platform Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor dispensary verifications, user activity, and medicine reservation metrics.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Aggregating platform metrics..." />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard
              title="Total Users"
              value={reports?.users?.total || 0}
              icon={Users}
              color="teal"
              subtitle={`${reports?.users?.patients || 0} Patients, ${reports?.users?.pharmacyUsers || 0} Staff`}
            />
            <StatsCard
              title="Verified Pharmacies"
              value={reports?.pharmacies?.verified || 0}
              icon={ShieldCheck}
              color="emerald"
              subtitle={`Out of ${reports?.pharmacies?.total || 0} registered stores`}
            />
            <StatsCard
              title="Pending Approval"
              value={reports?.pharmacies?.pending || 0}
              icon={ShieldAlert}
              color={reports?.pharmacies?.pending > 0 ? 'rose' : 'teal'}
              subtitle="Requires admin verification"
            />
            <StatsCard
              title="Total Reservations"
              value={reports?.reservations?.total || 0}
              icon={Calendar}
              color="blue"
              subtitle={`₹${reports?.reservations?.totalSales || 0} completed volume`}
            />
          </div>

          {/* Quick Action Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Pharmacy Verifications Banner */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Pharmacy Verifications</h3>
                  <p className="text-xs text-slate-500">Approve or reject pharmacy registrations</p>
                </div>
                <Link
                  to="/admin/pharmacies"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                >
                  <span>Review stores</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {reports?.pharmacies?.pending > 0 ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-orange-900 block font-bold text-sm">
                      {reports?.pharmacies?.pending} Stores Awaiting Approval
                    </strong>
                    <span className="text-orange-700">
                      Unverified stores cannot be marked as verified in patient searches.
                    </span>
                  </div>
                  <Link
                    to="/admin/pharmacies?filter=pending"
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
                  >
                    Verify
                  </Link>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  All registered pharmacies are currently verified.
                </div>
              )}
            </div>

            {/* Quick Links & Platform Health */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Administrative Navigation</h3>
                <p className="text-xs text-slate-500">Manage directory and platform records</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link
                  to="/admin/users"
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/50 hover:border-teal-200 transition-all block"
                >
                  <Users className="w-5 h-5 text-teal-600 mb-2" />
                  <strong className="text-slate-900 block font-bold">User Directory</strong>
                  <span className="text-slate-500">Search and audit users by role</span>
                </Link>

                <Link
                  to="/admin/pharmacies"
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/50 hover:border-teal-200 transition-all block"
                >
                  <Store className="w-5 h-5 text-teal-600 mb-2" />
                  <strong className="text-slate-900 block font-bold">Pharmacies</strong>
                  <span className="text-slate-500">View and verify all dispensaries</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
