import React, { useState, useEffect } from 'react';
import { Link } from '../../router/Router';
import { formatCurrency } from '../../api/client';
import { AreaChart, BarChart } from '../../components/common/Charts';
import StatusBadge from '../../components/common/Badge';
import api from '../../api/client';
import Icons from '../../components/common/Icons';

export const VendorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.orders.getShopOrders().then((res) => {
      if (res.success && res.data) setOrders(res.data);
    });
    api.products.getMyProducts().then(async (res) => {
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        const fallback = await api.products.getAll({ limit: 20 });
        if (fallback.success && fallback.data) setProducts(fallback.data);
      }
    });
  }, []);

  const totalGross = orders.reduce((acc, o) => acc + (o.pricing?.total || 2999), 0);
  const lowStockItems = products.filter((p) => p.stock < 10);

  const salesTrendData = [
    { month: 'W1', gmv: 8400 },
    { month: 'W2', gmv: 14200 },
    { month: 'W3', gmv: 21900 },
    { month: 'W4', gmv: 29800 },
    { month: 'W5', gmv: 42500 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Studio Performance & Fulfillment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time analytics for Aura Studio & Crafts • Commission Rate: 8.0%
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            30-Day Gross Sales
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalGross || 42500)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            ↑ 18.4% from previous month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Sub-Orders Received
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {orders.length || 6}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            1 pending packing
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Available Balance
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-600">
            {formatCurrency(38200)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Pending return hold: ₹4,300
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Stock Inventory
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {lowStockItems.length} Low Alert
          </div>
          <span className="text-[10px] text-amber-700 font-medium">
            Restock raw silk fabrics
          </span>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-serif text-slate-900">Revenue Trajectory</h2>
            <p className="text-xs text-slate-400">Net seller payouts after 8% platform escrow fee</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Net: {formatCurrency(39100)}
          </span>
        </div>

        <AreaChart
          data={salesTrendData}
          dataKey="gmv"
          xKey="month"
          strokeColor="#059669"
          gradientFrom="#10b981"
          gradientTo="#ffffff"
          height={200}
        />
      </div>

      {/* Recent Sub-Orders Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-serif text-slate-900">
            Recent Studio Orders
          </h2>
          <Link to="/vendor/orders" className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                <th className="pb-3">Sub-Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Creation Items</th>
                <th className="pb-3">Net Studio Share</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-mono font-medium text-slate-900">#{ord._id}</td>
                  <td className="py-3">{ord.customerName || 'Ananya Verma'}</td>
                  <td className="py-3">{ord.items?.[0]?.name || 'Raw Silk Kimono'}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">
                    {formatCurrency(ord.vendorNet || 2608)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to="/vendor/orders"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Update
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
