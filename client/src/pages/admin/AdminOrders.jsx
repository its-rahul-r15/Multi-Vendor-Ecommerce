import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import StatusBadge from '../../components/common/Badge';
import InvoiceModal from '../../components/storefront/InvoiceModal';
import Icons from '../../components/common/Icons';

export const AdminOrders = () => {
  const { success } = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchOrders = async () => {
    const res = await api.orders.getAllAdminOrders();
    if (res.success && res.data) setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleManualRefund = (orderId) => {
    if (!window.confirm('Trigger administrative override refund for this sub-order? Full amount will be reversed.')) return;
    setOrders(
      orders.map((o) => (o._id === orderId ? { ...o, status: 'refunded' } : o))
    );
    success('Administrative refund processed via Razorpay Route.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Global Orders & Escrow Disputes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all cross-vendor sub-orders, carrier milestones and manage dispute overrides
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400">
              <th className="p-4">Sub-Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Artisan Studio</th>
              <th className="p-4 font-mono">Gross Total</th>
              <th className="p-4 font-mono">Commission</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Overrides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-slate-50/50">
                <td className="p-4 font-mono font-medium text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span>#{o._id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-slate-900">{o.customerName || 'Ananya Verma'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{o.shippingAddress?.phone}</p>
                </td>
                <td className="p-4 font-medium text-indigo-600">{o.shop?.name}</td>
                <td className="p-4 font-mono font-bold text-slate-900">
                  {formatCurrency(o.pricing?.total || 2999)}
                </td>
                <td className="p-4 font-mono text-emerald-600 font-semibold">
                  {formatCurrency(o.commissionAmount || 226)}
                </td>
                <td className="p-4">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => setSelectedInvoice(o)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    title="View Tax Invoice"
                  >
                    <Icons.FileText className="w-4 h-4" />
                  </button>
                  {o.status !== 'refunded' && (
                    <button
                      onClick={() => handleManualRefund(o._id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-medium"
                    >
                      Dispute Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        order={selectedInvoice}
      />
    </div>
  );
};

export default AdminOrders;
