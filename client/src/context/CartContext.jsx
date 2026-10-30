import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('gallikart_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const { success, error, info } = useToast();

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gallikart_cart', JSON.stringify(items));
    } catch (e) {
      console.warn(e);
    }
  }, [items]);

  // Sync server cart on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.cart.get().then((res) => {
        if (res.success && res.data?.items && Array.isArray(res.data.items)) {
          // If server cart has items, sync them
          const serverItems = res.data.items
            .filter((i) => i.productId)
            .map((i) => ({
              product: i.productId,
              quantity: i.quantity,
              price: i.price || i.productId?.discountedPrice || i.productId?.price,
              selectedSize: i.size || i.productId?.sizes?.[0] || 'Standard',
              selectedColor: i.color || i.productId?.colors?.[0] || 'Original',
            }));
          if (serverItems.length > 0) {
            setItems(serverItems);
          }
        }
      }).catch(() => {});
    }
  }, []);

  // Group items by vendor / shop
  const vendorGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const shop = item.product?.shopId || item.product?.shop || { _id: 'shop-vendor', name: 'Artisan Workshop' };
      const shopId = shop._id || 'shop-vendor';
      if (!groups[shopId]) {
        groups[shopId] = {
          shop: typeof shop === 'object' ? shop : { _id: shop, name: 'Artisan Workshop' },
          items: [],
          subtotal: 0,
        };
      }
      groups[shopId].items.push(item);
      groups[shopId].subtotal += (item.price || 0) * item.quantity;
    });
    return Object.values(groups);
  }, [items]);

  // Totals calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  }, [items]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    if (appliedCoupon?.discountType === 'shipping') return 0;
    return subtotal >= 1500 ? 0 : 99;
  }, [subtotal, appliedCoupon]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discount || 0;
  }, [appliedCoupon]);

  const tax = useMemo(() => {
    return Math.round(subtotal * 0.05); // 5% GST
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + shipping + tax - discount);
  }, [subtotal, shipping, tax, discount]);

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const addToCart = async (product, quantity = 1, options = {}) => {
    const token = localStorage.getItem('token');
    if (token && product._id) {
      api.cart.addItem(product._id, quantity).catch(() => {});
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product?._id === product._id &&
          i.selectedSize === options.size &&
          i.selectedColor === options.color
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedSize: options.size || product.sizes?.[0] || 'Standard',
          selectedColor: options.color || product.colors?.[0] || 'Original',
          price: product.salePrice || product.price,
        },
      ];
    });

    success(`Added "${product.name}" to cart`);
    setIsDrawerOpen(true);
  };

  const updateQuantity = async (index, newQuantity) => {
    const item = items[index];
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const token = localStorage.getItem('token');
    if (token && item?.product?._id) {
      api.cart.updateItem(item.product._id, newQuantity).catch(() => {});
    }

    setItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = newQuantity;
      return copy;
    });
  };

  const removeFromCart = async (index) => {
    const item = items[index];
    const token = localStorage.getItem('token');
    if (token && item?.product?._id) {
      api.cart.removeItem(item.product._id).catch(() => {});
    }

    setItems((prev) => prev.filter((_, i) => i !== index));
    info('Item removed from cart');
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.cart.clear().catch(() => {});
    }
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.coupons.validate(code, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        success(`Coupon ${res.data.code} applied! Saved ₹${res.data.discount}`);
      } else {
        error(res.error || 'Invalid coupon');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    info('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
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
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        couponLoading,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
