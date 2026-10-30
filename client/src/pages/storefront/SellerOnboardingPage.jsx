import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import Icons from '../../components/common/Icons';

export const SellerOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [existingShop, setExistingShop] = useState(null);
  const [checkingShop, setCheckingShop] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    shopName: '',
    city: '',
    category: 'Clothing',
    description: '',
    gstin: '',
    pan: '',
    bankAccount: '',
    ifsc: '',
    returnPolicy: '7 days return for unworn handcrafted apparel',
  });

  // Check if seller already has a registered shop
  useEffect(() => {
    let interval = null;
    let mounted = true;

    async function checkMyShop() {
      if (!user) {
        setCheckingShop(false);
        return;
      }
      try {
        const res = await api.shops.getMyShop();
        if (mounted && res.success && res.data) {
          setExistingShop(res.data);
          // If pending, poll every 6 seconds as specified in blueprint
          if (res.data.status === 'pending' && !interval) {
            interval = setInterval(async () => {
              const pollRes = await api.shops.getMyShop();
              if (pollRes.success && pollRes.data) {
                setExistingShop(pollRes.data);
                if (pollRes.data.status === 'approved') {
                  clearInterval(interval);
                }
              }
            }, 6000);
          }
        }
      } catch (err) {
        console.error('Error checking my shop:', err);
      } finally {
        if (mounted) setCheckingShop(false);
      }
    }

    checkMyShop();

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toastError('Please log in or register before submitting your artisan studio application.');
      navigate('/login?redirect=/sell');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shopName: form.shopName,
        category: form.category,
        description: form.description || `${form.shopName} handcrafted artisanal collections.`,
        address: {
          street: 'Main Workshop Street',
          city: form.city,
          state: 'Rajasthan',
          country: 'India',
          zipCode: '302001',
        },
        gstin: form.gstin,
        pan: form.pan,
        bankAccount: form.bankAccount,
        ifsc: form.ifsc,
        returnPolicy: form.returnPolicy,
      };

      const res = await api.shops.create(payload);
      if (res.success && res.data) {
        setExistingShop(res.data.shop || res.data);
        success('Artisan application submitted! Awaiting administrative KYC approval.');
      } else {
        toastError(res.error || 'Failed to submit application');
      }
    } catch (err) {
      toastError(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <Icons.Store className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">
          Sell on GalliKart Marketplace
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please sign in to your existing account or create a new seller account to begin studio onboarding.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/login?redirect=/sell"
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Sign In to Apply
          </Link>
          <Link
            to="/register?redirect=/sell"
            className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50"
          >
            Create Seller Account
          </Link>
        </div>
      </div>
    );
  }

  if (existingShop) {
    const isApproved = existingShop.status === 'approved';

    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
            isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {isApproved ? <Icons.CheckCircle className="w-8 h-8" /> : <Icons.Clock className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              isApproved
                ? 'text-emerald-700 bg-emerald-100/60'
                : 'text-amber-700 bg-amber-100/60'
            }`}
          >
            {isApproved ? 'Approved & Active' : 'Under Review • Polling KYC Status'}
          </span>
          <h1 className="text-3xl font-bold font-serif text-slate-900 mt-2">
            {isApproved
              ? `Welcome to ${existingShop.shopName || existingShop.name}!`
              : 'Your Artisan Studio Application is Under Review'}
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isApproved
              ? 'Your shop is fully approved by our curation team. You can now manage catalog listings, view incoming orders, and track payouts.'
              : 'Our marketplace curators review GSTIN verification and studio documentation. This page continuously checks for status changes.'}
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          {isApproved ? (
            <button
              onClick={() => navigate('/vendor')}
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              Open Vendor Dashboard →
            </button>
          ) : (
            <button
              onClick={() => navigate('/browse')}
              className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 cursor-pointer"
            >
              Explore Marketplace Catalog
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Artisan Partnerships
        </span>
        <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
          Sell on GalliKart Marketplace
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Join India's premier collective for independent weavers, studio ceramicists, and tailors. Transparent 8.5% commission, automated escrow settlements, and integrated BlueDart dispatch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Studio Details & Craft Department
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Studio / Workshop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Silk & Loom Atelier"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Craft Department / Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Clothing">Clothing & Handlooms</option>
              <option value="Jewelry">Jewelry & Silverwork</option>
              <option value="Electronics">Electronics & Lighting</option>
              <option value="Books">Books & Stationary</option>
              <option value="Other">Art & Ceramics</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Origin City / Cluster</label>
          <input
            type="text"
            required
            placeholder="e.g. Jaipur, Varanasi, Maheshwar"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Artisan Bio & Studio Philosophy</label>
          <textarea
            rows={3}
            placeholder="Tell buyers about your heritage weaving technique or studio kiln..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 pt-4">
          Statutory Verification & Tax Compliance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">GSTIN Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 08AAACX8812D1Z4"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">PAN Card Number</label>
            <input
              type="text"
              required
              placeholder="e.g. ABCDE1234F"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Bank Account Number (Payouts)</label>
            <input
              type="text"
              required
              placeholder="Enter current or savings account"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Bank IFSC Code</label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC0001234"
              value={form.ifsc}
              onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Store Return Policy Notice</label>
          <input
            type="text"
            required
            value={form.returnPolicy}
            onChange={(e) => setForm({ ...form, returnPolicy: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Registering Studio...' : 'Submit Studio KYC Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerOnboardingPage;
