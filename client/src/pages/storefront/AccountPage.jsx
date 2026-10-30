import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation, Link } from '../../router/Router';
import { formatCurrency, api } from '../../api/client';
import ProductCard from '../../components/storefront/ProductCard';
import Icons from '../../components/common/Icons';

export const AccountPage = () => {
  const { user, wishlist, logout } = useAuth();
  const { addToCart } = useCart();
  const location = useLocation();

  const initialTab = location.searchParams.get('tab') || 'addresses';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [addresses, setAddresses] = useState([]);
  const [tailoringRequests, setTailoringRequests] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    let mounted = true;

    api.auth.getAddresses().then((res) => {
      if (mounted && res.success && res.data) setAddresses(res.data);
    });

    api.tailoring.getMyRequests().then((res) => {
      if (mounted && res.success && res.data) setTailoringRequests(res.data);
    });

    api.products.getAll({ limit: 100 }).then((res) => {
      if (mounted && res.success) {
        setAllProducts(Array.isArray(res.data) ? res.data : []);
      }
    });

    api.coupons.getActive().then((res) => {
      if (mounted && res.success) {
        setCoupons(Array.isArray(res.data) ? res.data : []);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white text-xl font-serif font-bold flex items-center justify-center uppercase shadow-sm">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-slate-900">{user?.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'seller' && (
            <Link
              to="/vendor"
              className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-xs hover:bg-indigo-100 transition-colors"
            >
              Vendor Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 font-medium text-xs hover:bg-purple-100 transition-colors"
            >
              Admin Control Center
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px text-xs font-medium">
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Wishlist ({wishlist.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'coupons'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Vouchers ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('tailoring')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tailoring'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bespoke Tailoring ({tailoringRequests.length})
        </button>
      </div>

      {/* Tab 1: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-slate-900">Saved Addresses</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr, i) => (
              <div
                key={addr._id || i}
                className={`p-5 rounded-2xl bg-white border text-xs space-y-2 relative ${
                  addr.isDefault ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{addr.street}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-500">
                  {addr.city}, {addr.state} - {addr.zipCode}
                </p>
                <p className="text-slate-400 text-[11px] font-mono">India</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold font-serif text-slate-900">Saved Wishlist Pieces</h2>
          {wishlistProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
              <p className="text-xs text-slate-500">Your wishlist is currently empty.</p>
              <Link to="/browse" className="text-xs font-semibold text-indigo-600 hover:underline mt-2 inline-block">
                Discover pieces to save →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold font-serif text-slate-900">Available Marketplace Vouchers</h2>
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div
                  key={c._id || c.code}
                  className="p-5 rounded-2xl bg-white border border-dashed border-indigo-200 shadow-xs space-y-2 text-xs relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.validUntil ? `Valid till ${new Date(c.validUntil).toLocaleDateString()}` : 'Active'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `Flat ₹${c.discountValue} OFF`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    On minimum order value of ₹{c.minOrderValue || c.minPurchase || 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
              No active vouchers currently available. Check back soon for seasonal festive promotions.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tailoring Requests */}
      {activeTab === 'tailoring' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold font-serif text-slate-900">Custom Tailoring Consultations</h2>
          {tailoringRequests.length > 0 ? (
            tailoringRequests.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <span className="font-bold text-slate-900">{req.garmentType || req.serviceType || 'Bespoke Order'}</span>
                  <p className="text-[11px] text-slate-500">
                    Status: {req.status || 'Received'} • Date: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                  {req.measurements && (
                    <p className="text-[11px] text-slate-600 font-mono">
                      Chest: {req.measurements.chest || '-'}, Shoulder: {req.measurements.shoulder || '-'}, Sleeve: {req.measurements.sleeve || '-'}
                    </p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">
                  {req.status || 'In Review'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
              You haven't booked any bespoke tailoring consultations yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
