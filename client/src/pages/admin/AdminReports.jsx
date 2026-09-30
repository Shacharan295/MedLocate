import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  TrendingUp,
  Users,
  Store,
  Calendar,
  ShieldCheck,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await adminService.getReports();
        setReports(res.data?.data);
      } catch (err) {
        setError('Failed to load system reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          MedLocate Platform Health & Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Comprehensive operational metrics across patient activity, store verifications, and order fulfillment.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Generating platform performance metrics..." />
      ) : (
        <div className="space-y-6">
          {/* Executive Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard
              title="Registered Patients"
              value={reports?.users?.patients || 0}
              icon={Users}
              color="teal"
              subtitle={`Total users: ${reports?.users?.total || 0}`}
            />
            <StatsCard
              title="Verified Pharmacies"
              value={reports?.pharmacies?.verified || 0}
              icon={ShieldCheck}
              color="emerald"
              subtitle={`${reports?.pharmacies?.pending || 0} pending verification`}
            />
            <StatsCard
              title="Completed Pickups"
              value={reports?.reservations?.completed || 0}
              icon={CheckCircle2}
              color="blue"
              subtitle={`Out of ${reports?.reservations?.total || 0} total reservations`}
            />
            <StatsCard
              title="Gross Fulfillment Value"
              value={`₹${reports?.reservations?.totalSales?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              color="emerald"
              subtitle="Value of fulfilled orders"
            />
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">User Population</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Patient Accounts</span>
                  <strong className="text-slate-900">{reports?.users?.patients}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Pharmacy Staff</span>
                  <strong className="text-slate-900">{reports?.users?.pharmacyUsers}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Platform Admins</span>
                  <strong className="text-slate-900">
                    {(reports?.users?.total || 0) - (reports?.users?.patients || 0) - (reports?.users?.pharmacyUsers || 0)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Reservation Funnel */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Reservation Lifecycle</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-amber-50 text-amber-900 font-medium">
                  <span>Active Holds Pending Pickup</span>
                  <strong className="font-bold">{reports?.reservations?.active}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-emerald-50 text-emerald-900 font-medium">
                  <span>Successfully Picked Up</span>
                  <strong className="font-bold">{reports?.reservations?.completed}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 text-slate-700 font-medium">
                  <span>Cancelled or Expired</span>
                  <strong className="font-bold">{reports?.reservations?.cancelledOrExpired}</strong>
                </div>
              </div>
            </div>

            {/* Architecture & Infrastructure Status */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Architecture Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 text-teal-800">
                  <span>Geospatial 2dsphere Index</span>
                  <strong className="font-bold">Active ($geoNear)</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 text-teal-800">
                  <span>Atomic Concurrency Lock</span>
                  <strong className="font-bold">Protected ($gte / $inc)</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 text-teal-800">
                  <span>Hold Expiration Worker</span>
                  <strong className="font-bold">Scheduled (60s loop)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
