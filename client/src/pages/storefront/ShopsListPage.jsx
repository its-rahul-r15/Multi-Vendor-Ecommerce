import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '../../router/Router';
import { api } from '../../api/client';
import Icons from '../../components/common/Icons';

export const ShopsListPage = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadShops() {
      setLoading(true);
      try {
        const res = await api.shops.getAll();
        if (mounted && res.success) {
          setShops(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load shops:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadShops();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Independent Makers
        </span>
        <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
          Artisan Studios & Heritage Workshops
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Every shop is KYC vetted with fair wage guarantees and transparent return policies
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : shops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <div
              key={shop._id}
              onClick={() => navigate(`/shop/${shop.slug || shop._id}`)}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              {/* Banner preview */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                <img
                  src={shop.bannerUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800'}
                  alt={shop.shopName || shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Shop Details */}
              <div className="p-6 -mt-10 relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-end justify-between mb-3">
                    <img
                      src={shop.logoUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100'}
                      alt={shop.shopName || shop.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                    />
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                      <Icons.CheckCircle className="w-3.5 h-3.5" />
                      {shop.status === 'approved' ? 'Verified Studio' : 'Pending Verification'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {shop.shopName || shop.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {shop.address?.city || shop.city || 'India'} • {shop.category}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {shop.description || 'Dedicated to reviving master textile and craft heritage.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <Icons.Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{shop.rating?.average || shop.rating || 5.0}</span>
                    <span className="text-slate-400 font-normal">
                      ({shop.rating?.count || shop.reviewsCount || 0} reviews)
                    </span>
                  </div>
                  <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Visit Studio Storefront →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">No partner studios currently found.</p>
        </div>
      )}
    </div>
  );
};

export default ShopsListPage;
