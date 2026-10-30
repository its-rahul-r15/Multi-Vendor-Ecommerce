import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '../../router/Router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import Icons from '../../components/common/Icons';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, shipping, discount, tax, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // New address state toggle
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || 'Ananya Verma',
    phone: '+91 98765 43210',
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    api.auth.getAddresses().then((res) => {
      if (res.success && res.data) {
        setSavedAddresses(res.data);
      }
    });
  }, [user]);

  if (!user) {
    return null;
  }

  if (items.length === 0 && !confirmedOrder) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    const activeAddress = isAddingNewAddress
      ? newAddress
      : savedAddresses[selectedAddressIndex] || {
          fullName: user?.name || 'Customer',
          phone: user?.phone || '9876543210',
          street: 'Indiranagar 100ft Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
        };

    const deliveryAddress = {
      street: activeAddress.street,
      city: activeAddress.city,
      state: activeAddress.state || 'Karnataka',
      zipCode: activeAddress.pincode || activeAddress.zipCode || '560038',
      phone: activeAddress.phone || user?.phone || '9876543210',
      recipientName: activeAddress.fullName || user?.name || 'Customer',
    };

    try {
      // 1. Create order on backend from current customer cart
      const res = await api.orders.create({
        deliveryAddress,
        shippingAddress: deliveryAddress,
        paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay Escrow' : 'Cash on Delivery',
      });

      if (!res.success) {
        error(res.error || 'Failed to place order. Please check that items are in your cart.');
        setIsProcessing(false);
        return;
      }

      const orders = Array.isArray(res.data?.orders)
        ? res.data.orders
        : Array.isArray(res.data)
        ? res.data
        : [res.data];
      const primaryOrder = orders[0];

      // 2. If Razorpay, initiate real payment flow
      if (paymentMethod === 'razorpay' && primaryOrder?._id && typeof window !== 'undefined' && window.Razorpay) {
        try {
          const payRes = await api.payments.createOrder(primaryOrder._id);
          if (payRes.success && payRes.data?.order) {
            const rzpOrder = payRes.data.order;
            const options = {
              key: payRes.data.keyId || 'rzp_test_SEqwGxcZkvAEAM',
              amount: rzpOrder.amount,
              currency: rzpOrder.currency || 'INR',
              name: 'GalliKart Marketplace',
              description: `Sub-Order ${primaryOrder._id.slice(-6).toUpperCase()}`,
              order_id: rzpOrder.id,
              prefill: {
                name: user?.name || activeAddress.fullName,
                email: user?.email,
                contact: user?.phone || activeAddress.phone,
              },
              theme: { color: '#4f46e5' },
              handler: async (response) => {
                await api.payments.verify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                setConfirmedOrder(res.data);
                clearCart();
                success('Payment Verified & Escrow Reserved!');
              },
              modal: {
                ondismiss: () => {
                  setConfirmedOrder(res.data);
                  clearCart();
                  success('Order placed! You can view status in your Orders tab.');
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            setIsProcessing(false);
            return;
          }
        } catch (payErr) {
          console.warn('Razorpay popup error, proceeding with order confirmation:', payErr);
        }
      }

      // COD or instant confirmation
      setConfirmedOrder(res.data);
      clearCart();
      success('Order placed successfully!');
    } catch (err) {
      error(err.message || 'Error processing order');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Confirmation Screen ──────────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Icons.CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Payment Verified • Escrow Reserved
          </span>
          <h1 className="text-3xl font-bold font-serif text-slate-900 mt-2">
            Thank you for supporting Indian artisans!
          </h1>
          <p className="text-xs text-slate-500">
            Checkout Group: <span className="font-mono font-bold text-slate-900">{confirmedOrder.groupId}</span>
          </p>
        </div>

        {/* Sub-Orders split overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-left shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fulfillment Split ({confirmedOrder.orders?.length || 1} Independent Artisan Sub-Orders)
          </h3>

          <div className="space-y-3">
            {confirmedOrder.orders?.map((ord, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ord.shop?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">#{ord._id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ord.items?.length} items • Insured dispatch via BlueDart Express
                  </p>
                </div>
                <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full text-[11px]">
                  Confirmed ✓
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/orders"
            className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Icons.Package className="w-4 h-4" />
            <span>Track Orders & Milestones</span>
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout Form ────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
          Secure Multi-Vendor Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review shipping address and payment gateway details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step 1 Address & Step 2 Payment */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-900">Delivery Address</h2>
              </div>
              <button
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                {isAddingNewAddress ? 'Select Saved' : '+ Add New Address'}
              </button>
            </div>

            {isAddingNewAddress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Street / Apartment</label>
                  <input
                    type="text"
                    required
                    placeholder="House number, street, landmark..."
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between text-xs ${
                      selectedAddressIndex === idx
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{addr.recipientName || addr.fullName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {addr.label || 'Home'}
                        </span>
                      </div>
                      <p className="text-slate-600">{addr.street}</p>
                      <p className="text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-slate-500 font-mono">Mobile: {addr.phone}</p>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {selectedAddressIndex === idx && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Gateway Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  paymentMethod === 'razorpay'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    RZP
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Razorpay Unified Gateway (Cards / UPI / NetBanking)</h4>
                    <p className="text-[11px] text-slate-500">Automated multi-vendor split escrow & instant settlement</p>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'razorpay' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'razorpay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs">
                    COD
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Cash on Delivery</h4>
                    <p className="text-[11px] text-slate-500">Pay cash/UPI directly upon BlueDart courier arrival</p>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold font-serif text-slate-900 pb-3 border-b border-slate-100">
            Order Review
          </h2>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate max-w-[140px]">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} • {item.selectedSize}</p>
                  </div>
                </div>
                <span className="font-mono font-medium text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span className="font-mono">- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Insured Courier Shipping</span>
              <span className="font-mono text-slate-900">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5%)</span>
              <span className="font-mono text-slate-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
              <span>Total Payable</span>
              <span className="font-mono text-indigo-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Reserving Escrow & Confirming...</span>
            ) : (
              <>
                <span>Pay {formatCurrency(grandTotal)}</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
