import React, { useState } from 'react';
import { useNavigate, Link } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import Icons from '../../components/common/Icons';

export const AuthPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('customer'); // 'customer' | 'seller'
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    shopName: '',
    city: '',
    category: 'Clothing',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');

    if (mode === 'login') {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        if (redirectUrl) {
          navigate(redirectUrl);
          return;
        }
        if (res.user?.role === 'seller') navigate('/vendor');
        else if (res.user?.role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setErrorMessage(res.error || 'Login failed. Please check your email and password.');
      }
    } else {
      // Validate phone
      const phoneClean = formData.phone.replace(/[^0-9]/g, '');
      if (!/^[6-9]\d{9}$/.test(phoneClean)) {
        setErrorMessage('Please enter a valid 10-digit Indian mobile number (starts with 6-9).');
        return;
      }

      // Validate password (at least 8 chars, 1 uppercase, 1 number)
      if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        setErrorMessage('Password must be at least 8 characters with at least 1 uppercase letter and 1 number.');
        return;
      }

      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: phoneClean,
        role,
      });

      if (res.success) {
        if (redirectUrl) {
          navigate(redirectUrl);
          return;
        }
        if (role === 'seller') navigate('/vendor/settings');
        else navigate('/');
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    }
  };

  const handleFillAdmin = () => {
    setMode('login');
    setFormData((prev) => ({
      ...prev,
      email: 'admin@gallikart.com',
      password: 'admin123',
    }));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
            G
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">
            {mode === 'login' ? 'Welcome back to GalliKart' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Sign in to access your orders, artisan shop, or admin controls'
              : 'Sign up to shop or register your independent craft studio'}
          </p>
        </div>

        {/* Existing Accounts Helper Pill */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-indigo-950 block text-[11px]">Existing Admin Account:</span>
            <span className="text-[11px] text-indigo-700 font-mono">admin@gallikart.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillAdmin}
            className="px-3 py-1 bg-white border border-indigo-200 text-indigo-900 font-semibold text-[11px] rounded-lg hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            Fill Admin
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
            <Icons.AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role selector if register mode */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-xl border text-center font-medium transition-all ${
                  role === 'customer'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Customer Account
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`p-3 rounded-xl border text-center font-medium transition-all ${
                  role === 'seller'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Artisan / Vendor
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number (10 digits)</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {mode === 'register' && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must be at least 8 characters with 1 uppercase letter and 1 digit.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Create Real Account'}</span>
              <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
