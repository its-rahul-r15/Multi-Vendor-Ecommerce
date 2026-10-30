import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/Badge';
import Icons from '../../components/common/Icons';

export const VendorOrders = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [shippingModalOrder, setShippingModalOrder] = useState(null);
  const [packingSlipOrder, setPackingSlipOrder] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    carrier: 'BlueDart Express',
    trackingNumber: '',
  });

  const fetchOrders = async () => {
    const res = await api.orders.getShopOrders();
    if (res.success && res.data) setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const res = await api.orders.updateStatus(orderId, { status: newStatus });
    if (res.success) {
      success(res.message || `Order marked as ${newStatus}`);
      fetchOrders();
    } else {
      error(res.error || 'Failed to update order status');
    }
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (!shippingForm.trackingNumber.trim()) return;

    const res = await api.orders.updateStatus(shippingModalOrder._id, {
      status: 'shipped',
      carrier: shippingForm.carrier,
      trackingNumber: shippingForm.trackingNumber,
    });

    if (res.success) {
      success(`Order dispatched with tracking #${shippingForm.trackingNumber}`);
      setShippingModalOrder(null);
      fetchOrders();
    } else {
      error(res.error || 'Failed to dispatch order');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Studio Orders & Fulfillment Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pack orders, assign courier airway bill tracking numbers and confirm deliveries
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-1 text-xs">
        {['all', 'confirmed', 'packed', 'shipped', 'delivered'].map((tab) => (
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
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500">No orders currently in this status.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">#{order._id}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-[11px] text-slate-400">
                    Placed: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPackingSlipOrder(order)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 shadow-2xs"
                  >
                    <Icons.Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Packing Slip</span>
                  </button>

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'packed')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      Mark Packed
                    </button>
                  )}

                  {order.status === 'packed' && (
                    <button
                      onClick={() => {
                        setShippingModalOrder(order);
                        setShippingForm({
                          carrier: 'BlueDart Express',
                          trackingNumber: 'BLUEDART-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN',
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <Icons.Truck className="w-3.5 h-3.5" />
                      <span>Dispatch & Add Tracking</span>
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'delivered')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Confirm Delivered
                    </button>
                  )}
                </div>
              </div>

              {/* Items & Recipient Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                    Pieces to Dispatch:
                  </span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <img
                        src={item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                        alt="Product"
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{item.name || item.product?.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity} • {item.selectedSize} • {item.selectedColor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                  <span className="font-bold text-slate-900 block text-xs">Customer Delivery Destination</span>
                  <p className="text-slate-700 font-medium">{order.shippingAddress?.fullName || order.customerName}</p>
                  <p className="text-slate-500">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                  <p className="text-slate-500">Pincode: {order.shippingAddress?.pincode} • Phone: {order.shippingAddress?.phone}</p>
                  <div className="pt-1 text-slate-900 font-mono font-semibold">
                    Net Studio Payout: {formatCurrency(order.vendorNet || 2608)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Modal */}
      <Modal
        isOpen={Boolean(shippingModalOrder)}
        onClose={() => setShippingModalOrder(null)}
        title="Dispatch Sub-Order"
        subtitle={`Order #${shippingModalOrder?._id}`}
      >
        <form onSubmit={handleShipSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Logistics Carrier</label>
            <select
              value={shippingForm.carrier}
              onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option>BlueDart Express</option>
              <option>Delhivery Surface</option>
              <option>DTDC Air</option>
              <option>India Post SpeedPost</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Airway Bill / Tracking Number</label>
            <input
              type="text"
              required
              placeholder="e.g. BLUEDART-89412093IN"
              value={shippingForm.trackingNumber}
              onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShippingModalOrder(null)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-sm"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Packing Slip Modal */}
      <Modal
        isOpen={Boolean(packingSlipOrder)}
        onClose={() => setPackingSlipOrder(null)}
        title="Packing Slip"
        subtitle={`Order #${packingSlipOrder?._id}`}
        maxWidth="max-w-md"
      >
        {packingSlipOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3 font-mono">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900 font-sans">Aura Studio & Crafts</span>
                <p className="text-[10px] text-slate-500">Handloom & Studio Collective</p>
              </div>

              <div className="text-[11px] space-y-1">
                <p>Deliver To: {packingSlipOrder.shippingAddress?.fullName}</p>
                <p>{packingSlipOrder.shippingAddress?.street}</p>
                <p>{packingSlipOrder.shippingAddress?.city} - {packingSlipOrder.shippingAddress?.pincode}</p>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px]">
                <p className="font-bold">Contents:</p>
                {packingSlipOrder.items?.map((item, i) => (
                  <p key={i}>• {item.quantity}x {item.name || item.product?.name} ({item.selectedSize})</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Icons.Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorOrders;
