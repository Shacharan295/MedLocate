import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { Activity, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);

      // Route to appropriate role dashboard
      if (user.role === 'pharmacy') {
        navigate('/pharmacy/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-teal-600 to-teal-400 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to MedLocate
          </h2>
          <p className="text-xs text-slate-500">
            Access live stock searches, reservations, and pharmacy management.
          </p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick-Fill Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            Demo Evaluator Quick Fill:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('patient@medlocate.demo', 'password123')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('pharmacy@medlocate.demo', 'password123')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors"
            >
              Pharmacy
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@medlocate.demo', 'password123')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:underline">
            Register as Patient
          </Link>{' '}
          or{' '}
          <Link to="/pharmacy-register" className="font-semibold text-teal-600 hover:underline">
            Register Pharmacy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
