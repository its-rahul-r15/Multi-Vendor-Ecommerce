import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Icons from '../../components/common/Icons';

export const VendorSettings = () => {
  const { success, error: toastError } = useToast();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    city: '',
    category: '',
    description: '',
    returnPolicy: '',
    logoUrl: '',
    bannerUrl: '',
    gstin: '',
    pan: '',
  });

  useEffect(() => {
    let mounted = true;
    async function loadShop() {
      setLoading(true);
      try {
        const res = await api.shops.getMyShop();
        if (mounted && res.success && res.data) {
          const s = res.data;
          setShop(s);
          setForm({
            name: s.shopName || s.name || '',
            city: s.address?.city || s.city || '',
            category: s.category || '',
            description: s.description || '',
            returnPolicy: s.returnPolicy || '7-day returns for unworn pieces with security tag attached.',
            logoUrl: s.logoUrl || '',
            bannerUrl: s.bannerUrl || '',
            gstin: s.gstin || '',
            pan: s.pan || '',
          });
        }
      } catch (err) {
        console.error('Failed to load shop settings:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadShop();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop?._id) return;
    setSaving(true);
    try {
      const res = await api.shops.updateMyShop(shop._id, {
        shopName: form.name,
        description: form.description,
        returnPolicy: form.returnPolicy,
        logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl,
        gstin: form.gstin,
        pan: form.pan,
        address: {
          ...shop.address,
          city: form.city,
        },
      });

      if (res.success) {
        success('Studio profile and settings updated successfully!');
      } else {
        toastError(res.error || 'Failed to update settings');
      }
    } catch (err) {
      toastError(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div className="h-8 w-64 bg-slate-100 rounded" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Studio Profile & KYC Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your public branding, official GSTIN registration, and return policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Verification Status Pill */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
              <Icons.CheckCircle className="w-5 h-5" />
            </span>
            <div>
              <span className="font-bold text-emerald-950 text-xs block">
                KYC & Business Status: {shop?.status === 'approved' ? 'Approved ✓' : 'In Review'}
              </span>
              <p className="text-[11px] text-emerald-700">
                Verified Seller: <span className="font-mono">{shop?.shopName || shop?.name || 'Studio'}</span>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold text-[10px]">
            {shop?.status === 'approved' ? 'ACTIVE ESCROW' : 'PENDING'}
          </span>
        </div>

        {/* Studio Branding */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Public Studio Storefront Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Studio Display Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Origin City / Cluster</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Artisan Bio & Philosophy</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Logo Image URL</label>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Cover Banner URL</label>
              <input
                type="url"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Statutory & Tax Details */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Statutory Compliance & Return Policy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">GSTIN Number</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">PAN Card Number</label>
              <input
                type="text"
                value={form.pan}
                onChange={(e) => setForm({ ...form, pan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Store Return Policy Notice</label>
            <input
              type="text"
              value={form.returnPolicy}
              onChange={(e) => setForm({ ...form, returnPolicy: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Studio Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorSettings;
