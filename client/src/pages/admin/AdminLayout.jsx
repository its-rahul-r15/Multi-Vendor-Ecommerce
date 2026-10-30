import React from 'react';
import { Link, useLocation } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import Icons from '../../components/common/Icons';

export const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Platform Overview', path: '/admin', icon: 'LayoutDashboard' },
    { label: 'Artisan Shops & KYC', path: '/admin/shops', icon: 'Store' },
    { label: 'Product Moderation', path: '/admin/products', icon: 'ShieldCheck' },
    { label: 'Global Orders & Disputes', path: '/admin/orders', icon: 'Package' },
    { label: 'Payouts & Ledger CSV', path: '/admin/payouts', icon: 'DollarSign' },
    { label: 'Platform Settings', path: '/admin/settings', icon: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── Admin Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 flex flex-col justify-between">
        <div>
          {/* Logo & Mark */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                A
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  Super Admin
                </span>
                <span className="text-[10px] text-indigo-400 font-medium">Control Center</span>
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
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icons.ShieldCheck className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Icons.ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Storefront Customer View</span>
          </Link>
          <div className="px-3 py-2 rounded-xl bg-slate-800/80 text-[11px] text-slate-400">
            <span className="font-semibold text-white block">Escrow Ledger Engine</span>
            <span className="text-emerald-400 font-mono">Status: Healthy ✓</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Security Mode:</span>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Role: SuperAdmin (Strict RBAC)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono">
              Cluster: ap-south-1 (Mumbai)
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center uppercase">
              {user?.name ? user.name[0] : 'A'}
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

export default AdminLayout;
