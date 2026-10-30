import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../router/Router';
import { formatCurrency } from '../../api/client';
import Icons from './Icons';

export const CartDrawer = () => {
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
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    couponLoading,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#f2d5e0] animate-fade-in">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#f2d5e0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-pink-50 text-brand-primary flex items-center justify-center border border-pink-200">
                <Icons.ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900">Your Shopping Bag</h2>
                <p className="text-xs text-stone-500">{totalCount} handcrafted {totalCount === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List grouped by Vendor */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                  <Icons.ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Explore fine artisanal textiles, handcrafted stoneware and curated home essentials.
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/browse');
                  }}
                  className="mt-5 px-5 py-2.5 text-xs font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              vendorGroups.map((group) => (
                <div key={group.shop._id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
                  {/* Vendor header */}
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/60 text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Icons.Store className="w-3.5 h-3.5 text-indigo-500" />
                      {group.shop.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      Subtotal: {formatCurrency(group.subtotal)}
                    </span>
                  </div>

                  {/* Items from this vendor */}
                  <div className="space-y-3">
                    {group.items.map((item, idx) => {
                      // find index in global items array
                      const globalIndex = items.findIndex((i) => i === item);
                      return (
                        <div key={idx} className="flex gap-3 bg-white p-3 rounded-xl border border-pink-100">
                          <img
                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200'}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded-lg bg-pink-50/50 shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-stone-900 line-clamp-1">
                                {item.product?.name}
                              </h4>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {item.selectedSize} • {item.selectedColor}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-bold text-stone-900 font-mono">
                                {formatCurrency(item.price)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center border border-pink-200 rounded-lg bg-white">
                                  <button
                                    onClick={() => updateQuantity(globalIndex, item.quantity - 1)}
                                    className="p-1 text-stone-500 hover:text-brand-primary cursor-pointer"
                                  >
                                    <Icons.Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs px-2.5 font-mono font-bold text-stone-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(globalIndex, item.quantity + 1)}
                                    className="p-1 text-stone-500 hover:text-brand-primary cursor-pointer"
                                  >
                                    <Icons.Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(globalIndex)}
                                  className="p-1 text-stone-400 hover:text-brand-primary transition-colors cursor-pointer"
                                >
                                  <Icons.Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3.5">
              {/* Coupon Section */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. AURA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full text-xs uppercase px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {appliedCoupon && (
                    <span className="absolute right-2 top-2 text-[10px] text-emerald-600 font-medium">
                      Applied ✓
                    </span>
                  )}
                </div>
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
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                )}
              </div>

              {/* Price Calculation breakdown */}
              <div className="text-xs space-y-1.5 text-stone-600 border-t border-[#f2d5e0]/60 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-900">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-mono">- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-stone-900">
                    {shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (5%)</span>
                  <span className="font-mono text-stone-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-[#f2d5e0]">
                  <span>Grand Total</span>
                  <span className="font-mono text-brand-primary text-base font-bold">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 bg-brand-primary hover:bg-brand-primary text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <span>Proceed to Secure Checkout</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-stone-400">
                🔒 Escrow Secured • 100% Verified Indian Artisans • 7-Day Returns
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
