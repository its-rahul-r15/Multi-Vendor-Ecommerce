import React, { useState, useEffect } from 'react';
import { Link } from '../../router/Router';
import { formatCurrency } from '../../api/client';
import { AreaChart } from '../../components/common/Charts';
import api from '../../api/client';
import Icons from '../../components/common/Icons';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    gmv: 1248500,
    commissionEarned: 106120,
    activeShops: 4,
    pendingKycCount: 1,
    payoutsDue: 42800,
    monthlySales: [
      { month: 'Jun', gmv: 420000 },
      { month: 'Jul', gmv: 580000 },
      { month: 'Aug', gmv: 710000 },
      { month: 'Sep', gmv: 890000 },
      { month: 'Oct', gmv: 1248500 },
    ],
  });

  useEffect(() => {
    api.admin.getStats().then((res) => {
      if (res.success && res.data) {
        const raw = res.data;
        const st = raw.statistics || raw;
        setStats((prev) => ({
          ...prev,
          gmv: raw.gmv !== undefined ? raw.gmv : (st.gmv || prev.gmv),
          commissionEarned: raw.commissionEarned !== undefined ? raw.commissionEarned : (st.commissionEarned || prev.commissionEarned),
          activeShops: raw.approvedShops !== undefined ? raw.approvedShops : (st.approvedShops || prev.activeShops),
          pendingKycCount: st.pendingShops !== undefined ? st.pendingShops : prev.pendingKycCount,
        }));
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Marketplace Intelligence & Platform Operations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Unified multi-vendor GMV, fee margins, and escrow compliance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform GMV
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(stats.gmv)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            ↑ 24.8% Month-over-Month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Commission Margin Earned
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-600">
            {formatCurrency(stats.commissionEarned)}
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">
            Avg 8.5% platform take-rate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Verified Artisan Studios
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats.activeShops} Active
          </div>
          <span className="text-[10px] text-amber-600 font-medium">
            {stats.pendingKycCount} pending KYC audit
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Payouts Ready For Settlement
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(stats.payoutsDue)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Eligible past 7-day return
          </span>
        </div>
      </div>

      {/* Monthly Sales & Commission Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-serif text-slate-900">
              Gross Merchandise Value (GMV) Trend
            </h2>
            <p className="text-xs text-slate-400">
              Total transaction volume processed across all partner artisan stores
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Monthly Volume
            </span>
          </div>
        </div>

        <AreaChart
          data={stats.monthlySales}
          dataKey="gmv"
          xKey="month"
          strokeColor="#4f46e5"
          gradientFrom="#6366f1"
          gradientTo="#ffffff"
          height={220}
        />
      </div>

      {/* Quick Ops Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/shops"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
            <Icons.Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Artisan Shop Moderation</h3>
          <p className="text-xs text-slate-500">
            Review incoming seller applications, verify PAN/GSTIN, and configure custom commission rates.
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
            <Icons.ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Product Approval Queue</h3>
          <p className="text-xs text-slate-500">
            Moderate artisan submissions, verify photography standards, and feature premier studio pieces.
          </p>
        </Link>

        <Link
          to="/admin/payouts"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
            <Icons.DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Automated Payout Engine</h3>
          <p className="text-xs text-slate-500">
            Execute Razorpay Route vendor transfers and export financial ledger reports in CSV format.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
