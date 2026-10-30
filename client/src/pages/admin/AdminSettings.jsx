import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Icons from '../../components/common/Icons';

export const AdminSettings = () => {
  const { success } = useToast();

  const [settings, setSettings] = useState({
    defaultCommissionBps: 800, // 8.0%
    shippingFlatPaise: 9900, // ₹99
    freeShippingAbovePaise: 150000, // ₹1,500
    returnWindowDays: 7,
    checkoutExpiryMinutes: 15,
    enableNearestRouting: false,
    razorpayKeyId: 'rzp_test_gallikart_2026',
    maintenanceMode: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    success('Platform settings and escrow parameters updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Platform Architecture & Policy Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure default escrow take-rates, shipping rules, return windows, and checkout reservation TTL
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Marketplace Financial Parameters */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Escrow & Financial Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Default Vendor Commission (Basis Points)
              </label>
              <input
                type="number"
                value={settings.defaultCommissionBps}
                onChange={(e) => setSettings({ ...settings, defaultCommissionBps: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {(settings.defaultCommissionBps / 100).toFixed(1)}% platform take-rate
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Customer Return Window (Days)
              </label>
              <input
                type="number"
                value={settings.returnWindowDays}
                onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Vendor payout settles automatically after this period
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Parameters */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Shipping & Checkout Stock Reservation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Flat Insured Courier Fee (₹)
              </label>
              <input
                type="number"
                value={settings.shippingFlatPaise / 100}
                onChange={(e) => setSettings({ ...settings, shippingFlatPaise: Number(e.target.value) * 100 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeShippingAbovePaise / 100}
                onChange={(e) => setSettings({ ...settings, freeShippingAbovePaise: Number(e.target.value) * 100 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Checkout Stock Lock TTL (Minutes)
              </label>
              <input
                type="number"
                value={settings.checkoutExpiryMinutes}
                onChange={(e) => setSettings({ ...settings, checkoutExpiryMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Unpaid orders auto-cancel and release reserved inventory
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Razorpay Public Key ID
              </label>
              <input
                type="text"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">Hyperlocal Geofence Routing</span>
              <p className="text-[11px] text-slate-400">
                Route orders strictly by customer GPS proximity vs actual added artisan items (default: off)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, enableNearestRouting: !settings.enableNearestRouting })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.enableNearestRouting ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enableNearestRouting ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
          >
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
