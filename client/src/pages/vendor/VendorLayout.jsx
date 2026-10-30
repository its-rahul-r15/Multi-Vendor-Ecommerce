import React from 'react';
import { Link, useLocation } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import Icons from '../../components/common/Icons';

export const VendorLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/vendor', icon: 'LayoutDashboard' },
    { label: 'Orders & Dispatch', path: '/vendor/orders', icon: 'Package' },
    { label: 'Product Catalog', path: '/vendor/products', icon: 'ShoppingBag' },
    { label: 'Earnings & Ledger', path: '/vendor/earnings', icon: 'DollarSign' },
    { label: 'Customer Reviews', path: '/vendor/reviews', icon: 'Star' },
    { label: 'Shop Settings & KYC', path: '/vendor/settings', icon: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── Vendor Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 shrink-0 flex flex-col justify-between">
        <div>
          {/* Studio Brand Branding */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/vendor" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                S
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Artisan Studio
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Vendor Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {/* Render matching icon or default */}
                    <Icons.Store className="w-4 h-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Icons.ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Storefront Customer View</span>
          </Link>
          <div className="px-3 py-2 rounded-xl bg-slate-50 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-800 block">Aura Studio & Crafts</span>
            <span className="text-emerald-600">KYC Verified & Approved ✓</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Shop ID:</span>
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              shop-101 (Jaipur)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live & Accepting Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center uppercase">
              {user?.name ? user.name[0] : 'S'}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
