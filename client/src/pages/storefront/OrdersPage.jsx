import React, { useState, useEffect } from 'react';
import { Link } from '../../router/Router';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import InvoiceModal from '../../components/storefront/InvoiceModal';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/Badge';
import Icons from '../../components/common/Icons';

export const OrdersPage = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Size / fit did not match expectations');

  const fetchOrders = async () => {
    const res = await api.orders.getMyOrders();
    if (res.success && res.data) {
      setOrders(res.data);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this sub-order? Full payment will be refunded to your source.')) return;
    const res = await api.orders.cancel(orderId);
    if (res.success) {
      success(res.message || 'Order cancelled. Refund initiated.');
      fetchOrders();
    } else {
      error(res.error || 'Failed to cancel order');
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    success(`Return request registered for Order #${returnOrder._id}. BlueDart pickup scheduled.`);
    setReturnOrder(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['confirmed', 'packed', 'shipped'].includes(o.status);
    if (activeTab === 'delivered') return o.status === 'delivered';
    if (activeTab === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
          Order Tracking & Sub-Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor studio fulfillment milestones, download GST invoices and manage 7-day returns
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-1 text-xs">
        {['all', 'active', 'delivered', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-all border-b-2 -mb-1 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Icons.Package className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No orders in this view</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            When you purchase handcrafted items, your vendor sub-orders will appear here with live milestones.
          </p>
          <Link
            to="/browse"
            className="inline-block mt-5 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isShipped = order.status === 'shipped';
            const isCancelled = order.status === 'cancelled';
            const canCancel = ['confirmed', 'packed'].includes(order.status);

            // Milestone step calculation
            const steps = [
              { label: 'Confirmed', done: true },
              { label: 'Packed', done: ['packed', 'shipped', 'delivered'].includes(order.status) },
              { label: 'Shipped', done: ['shipped', 'delivered'].includes(order.status) },
              { label: 'Delivered', done: order.status === 'delivered' },
            ];

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        Sub-Order #{order._id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Artisan Studio:{' '}
                      <span className="font-semibold text-slate-800">{order.shop?.name}</span> • Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Icons.FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>GST Invoice</span>
                    </button>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        onClick={() => setReturnOrder(order)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                      >
                        Request Return
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Order Milestones Timeline */}
                {!isCancelled && (
                  <div className="py-2">
                    <div className="flex items-center justify-between relative max-w-lg mx-auto">
                      {/* Connecting Line */}
                      <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-100 -z-0" />

                      {steps.map((st, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              st.done
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {st.done ? '✓' : i + 1}
                          </div>
                          <span
                            className={`text-[10px] font-medium ${
                              st.done ? 'text-slate-900 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Carrier tracking snippet if shipped */}
                    {order.shipment?.trackingNumber && (
                      <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 max-w-md mx-auto text-center text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {order.shipment.carrier || 'BlueDart Express'}:
                        </span>{' '}
                        <span className="font-mono text-indigo-600 font-medium">
                          {order.shipment.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items in this sub-order */}
                <div className="divide-y divide-slate-100 pt-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                          alt="Product"
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{item.name || item.product?.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} • {item.selectedSize} • {item.selectedColor}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sub-order bottom summary */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <p>
                    Delivering to:{' '}
                    <span className="font-medium text-slate-700">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}
                    </span>
                  </p>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    Sub-order Total: {formatCurrency(order.pricing?.total || 2999)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />

      {/* Return Request Modal */}
      <Modal
        isOpen={Boolean(returnOrder)}
        onClose={() => setReturnOrder(null)}
        title="Request Return & Refund"
        subtitle={`Order #${returnOrder?._id}`}
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Reason for Return</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option>Size / fit did not match expectations</option>
              <option>Artisanal fabric shade different than preview</option>
              <option>Transit damage on protective packaging</option>
              <option>Received alternate variant</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] space-y-1">
            <span className="font-bold">7-Day Escrow Return Guarantee:</span>
            <p>
              Once approved, our courier will collect the package from your address. The full payment of{' '}
              {formatCurrency(returnOrder?.pricing?.total || 0)} will be refunded directly to your payment source.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReturnOrder(null)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-sm"
            >
              Confirm Return Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
