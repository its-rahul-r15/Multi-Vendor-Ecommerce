import React, { useState, useEffect } from 'react';
import { useParams, Link } from '../../router/Router';
import { api } from '../../api/client';
import ProductCard from '../../components/storefront/ProductCard';
import Icons from '../../components/common/Icons';

export const VendorStorePage = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadShopAndProducts() {
      setLoading(true);
      try {
        // Fetch shop by slug / ID
        let foundShop = null;
        const res = await api.shops.getById(slug);
        if (res.success && res.data) {
          foundShop = res.data;
        } else {
          // Fallback search in all shops
          const allShops = await api.shops.getAll();
          if (allShops.success && Array.isArray(allShops.data)) {
            foundShop = allShops.data.find((s) => s.slug === slug || s._id === slug) || allShops.data[0];
          }
        }

        if (mounted && foundShop) {
          setShop(foundShop);
          // Fetch this shop's products
          const shopId = foundShop._id;
          const [spRes, allProdRes] = await Promise.allSettled([
            api.products.getShopProducts(shopId),
            api.products.getAll({ limit: 50 }),
          ]);

          let prods = [];
          if (spRes.status === 'fulfilled' && spRes.value?.success) {
            prods = Array.isArray(spRes.value.data) ? spRes.value.data : spRes.value.data?.products || [];
          }
          if (prods.length === 0 && allProdRes.status === 'fulfilled' && allProdRes.value?.success) {
            const list = Array.isArray(allProdRes.value.data) ? allProdRes.value.data : [];
            prods = list.filter((p) => p.shopId === shopId || p.shopId?._id === shopId || p.shop?._id === shopId);
          }
          setShopProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load shop page:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      loadShopAndProducts();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Icons.Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif">Studio Not Found</h2>
        <p className="text-xs text-slate-500">The artisan shop you requested could not be found or has not yet completed verification.</p>
        <Link to="/shops" className="inline-block text-xs font-semibold text-indigo-600 hover:underline">
          View All Partner Studios
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Studio Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
        <img
          src={shop.bannerUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200'}
          alt={shop.shopName || shop.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
      </div>

      {/* Studio Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={shop.logoUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100'}
              alt={shop.shopName || shop.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md shrink-0 bg-slate-100"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
                  {shop.shopName || shop.name}
                </h1>
                <span className="p-1 rounded-full bg-emerald-50 text-emerald-600" title="KYC Approved Artisan">
                  <Icons.CheckCircle className="w-5 h-5" />
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {shop.address?.city || shop.city || 'India'} • {shop.category}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Icons.Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  {shop.rating?.average || shop.rating || 5.0} ({shop.rating?.count || shop.reviewsCount || 0} verified reviews)
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-600 font-medium">Verified Active Studio</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 max-w-xs">
              <span className="font-semibold text-slate-900 block mb-0.5">Return Policy</span>
              <p className="text-[11px] text-slate-500">
                {shop.returnPolicy || '7-day returns for unworn pieces with security tag attached.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About & Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold font-serif text-slate-900 mb-2">Artisan Bio</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            {shop.description || 'Specializing in handcrafted textiles, heritage prints, and studio-finished heirloom artifacts.'}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Studio Catalog</h2>
              <p className="text-xs text-slate-500">Currently crafted and available pieces from this maker</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{shopProducts.length} items</span>
          </div>

          {shopProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shopProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              This maker currently has no active pieces in their public storefront.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorStorePage;
