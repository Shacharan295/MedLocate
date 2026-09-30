import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/api';
import ErrorMessage from '../../components/ErrorMessage';
import { Store, MapPin, Phone, ShieldCheck, Save, CheckCircle } from 'lucide-react';

export const PharmacyProfile = () => {
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    const fetchPharmacy = async () => {
      if (!user?.pharmacyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await pharmacyService.getById(user.pharmacyId);
        const data = res.data?.data?.pharmacy;
        if (data) {
          setPharmacy(data);
          setName(data.name || '');
          setAddress(data.address || '');
          setPhone(data.phone || '');
          const coords = data.location?.coordinates || [80.2337, 13.0418];
          setLongitude(coords[0]);
          setLatitude(coords[1]);
        }
      } catch (err) {
        setError('Failed to load pharmacy profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacy();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.pharmacyId) return;
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const res = await pharmacyService.updateProfile(user.pharmacyId, {
        name,
        address,
        phone,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });

      if (res.data?.success) {
        setMessage('Pharmacy details updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pharmacy details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Dispensary & Store Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Keep your pharmacy location and contact info up to date for patients searching nearby.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs font-semibold text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Verification Status Banner */}
        <div className="pb-6 mb-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Admin Verification Status
            </span>
            <div className="mt-1">
              {pharmacy?.verified ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Verified & Active in Public Search
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                  Pending Admin Approval
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pharmacy Trade Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Physical Address</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Dispensary Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Latitude (WGS84)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Longitude (WGS84)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PharmacyProfile;
