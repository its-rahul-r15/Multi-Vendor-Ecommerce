import React, { useState } from 'react';
import { Link, useNavigate } from '../../router/Router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../api/client';
import Icons from '../../components/common/Icons';

export const CartPage = () => {
  const { user } = useAuth();
  const {
    items,
    vendorGroups,
    subtotal,
    shipping,
    discount,
    tax,
    grandTotal,
    totalCount,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    couponLoading,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-brand-primary mx-auto mb-4 border border-pink-200">
          <Icons.ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-stone-900">Your shopping bag is empty</h2>
        <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1">
          Explore pure mulberry silks, stoneware drippers, and handcrafted decor from verified studios.
        </p>
        <Link
          to="/browse"
          className="inline-block mt-6 px-6 py-3.5 rounded-full bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary transition-all shadow-md cursor-pointer"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
          Shopping Bag ({totalCount} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Split into dedicated sub-orders per artisan studio for direct insured fulfillment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Multi-Vendor Grouped Items */}
        <div className="lg:col-span-8 space-y-6">
          {vendorGroups.map((group) => (
            <div
              key={group.shop._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
            >
              {/* Studio Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Icons.Store className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-xs text-slate-900">{group.shop.name}</span>
                  <span className="text-[10px] text-slate-400">({group.shop.city})</span>
                </div>
                <span className="text-xs font-mono font-medium text-slate-700">
                  Sub-order: {formatCurrency(group.subtotal)}
                </span>
              </div>

              {/* Items in this group */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item, idx) => {
                  const globalIndex = items.findIndex((i) => i === item);
                  return (
                    <div key={idx} className="py-3 flex gap-4 items-center">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200'}
                        alt={item.product?.name}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {item.product?.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Size: {item.selectedSize} • Shade: {item.selectedColor}
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-2">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(globalIndex, item.quantity - 1)}
                            className="p-1.5 text-slate-500 hover:text-slate-900"
                          >
                            <Icons.Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-mono text-xs font-medium text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(globalIndex, item.quantity + 1)}
                            className="p-1.5 text-slate-500 hover:text-slate-900"
                          >
                            <Icons.Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(globalIndex)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold font-serif text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          {/* Coupon Code Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-600">Promotional Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="AURA10 or FESTIVE500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full text-xs uppercase px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {appliedCoupon ? (
                <button
                  onClick={removeCoupon}
                  className="px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => applyCoupon(couponCode)}
                  disabled={couponLoading || !couponCode}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  Apply
                </button>
              )}
            </div>
            {appliedCoupon && (
              <p className="text-[11px] text-emerald-600 font-medium">
                Coupon {appliedCoupon.code} applied!
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="text-sm space-y-2.5 text-stone-600 border-t border-[#f2d5e0] pt-4">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-mono text-stone-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon Discount</span>
                <span className="font-mono">- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Insured Shipping</span>
              <span className="font-mono text-stone-900">
                {shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5%)</span>
              <span className="font-mono text-stone-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-stone-950 pt-3 border-t border-[#f2d5e0]">
              <span>Total Payable</span>
              <span className="font-mono text-brand-primary text-xl font-bold">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-4 px-4 bg-brand-primary hover:bg-brand-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <Icons.ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-stone-400 text-center">
            🔒 Escrow Protected • Razorpay 256-bit encryption • 7-day return window
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
