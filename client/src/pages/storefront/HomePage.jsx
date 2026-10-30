import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '../../router/Router';
import { api } from '../../api/client';
import HeroBannerCarousel from '../../components/storefront/HeroBannerCarousel';
import VisualCategoryRow from '../../components/storefront/VisualCategoryRow';
import ProductCard from '../../components/storefront/ProductCard';
import ShoppableVideoModal from '../../components/storefront/ShoppableVideoModal';
import TailoringModal from '../../components/storefront/TailoringModal';
import Icons from '../../components/common/Icons';

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [tailoringModalOpen, setTailoringModalOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    let mounted = true;
    async function loadHomeData() {
      setLoading(true);
      try {
        const [prodRes, shopRes, vidRes] = await Promise.allSettled([
          api.products.getFeatured().then(async (res) => {
            if (res.success && res.data?.length > 0) return res.data;
            const fallback = await api.products.getAll({ limit: 12 });
            return fallback.success ? fallback.data : [];
          }),
          api.shops.getAll({ limit: 4 }),
          api.shoppableVideos.getAll(),
        ]);

        if (mounted) {
          if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
            setProducts(prodRes.value);
          }
          if (shopRes.status === 'fulfilled' && shopRes.value?.success && Array.isArray(shopRes.value.data)) {
            setShops(shopRes.value.data);
          }
          if (vidRes.status === 'fulfilled' && vidRes.value?.success && Array.isArray(vidRes.value.data)) {
            setVideos(vidRes.value.data);
          }
        }
      } catch (e) {
        console.error('Failed to load home page live data:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
  };

  // Filter products by selected category if any
  const displayedProducts = products
    .filter((p) => {
      if (selectedCategory === 'All') return true;
      return (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.discountedPrice || a.price || 0) - (b.discountedPrice || b.price || 0);
      } else if (sortBy === 'price-high') {
        return (b.discountedPrice || b.price || 0) - (a.discountedPrice || a.price || 0);
      } else if (sortBy === 'rating') {
        return (b.rating?.average || b.rating || 0) - (a.rating?.average || a.rating || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-12 pb-20">
      
      {/* ── Top Hero Auto-Scrolling Banner Carousel (Top Deals & Collections) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <HeroBannerCarousel />
      </section>

      {/* ── Visual Categories Row (Reference: Etsy Curved Photos & Show More) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <VisualCategoryRow
          onCategorySelect={handleCategoryFilter}
          selectedCategory={selectedCategory}
        />
      </section>

      {/* ── Clean Filter & Sort Toolbar ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 py-3 border-b border-[#f2d5e0]">
          
          {/* Left: "All Filters" Button with Filter Sliders Icon */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => navigate('/browse')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[#f2d5e0] bg-white hover:bg-pink-50/60 text-stone-900 font-semibold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer hover:border-brand-primary"
            >
              <Icons.Sliders className="w-4 h-4 text-brand-primary" />
              <span>All Filters</span>
            </button>

            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-50 text-brand-primary text-sm font-semibold border border-pink-200">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-stone-900 cursor-pointer"
                  title="Clear filter"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>

          {/* Right: Item Count & Sort Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            <span className="text-stone-600 font-medium hidden sm:inline">
              {displayedProducts.length > 0 ? `${displayedProducts.length}+ Artisanal Pieces` : 'Available pieces'}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-stone-600 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#f2d5e0] rounded-full px-4 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:border-brand-primary shadow-xs cursor-pointer hover:border-pink-300"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated Handcrafted Products Grid ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="aspect-4/5 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Icons.Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700">No pieces found in this category.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              Reset to All Pieces
            </button>
          </div>
        )}
      </section>

      {/* ── Shoppable Video Reels Showcase ──────────────────────────────────── */}
      {videos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-pink-300 flex items-center gap-1.5 mb-1.5">
                  <Icons.Video className="w-4 h-4" />
                  Live Artisan Reels
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                  Craftsmanship in Motion
                </h2>
                <p className="text-sm text-stone-300 mt-1 max-w-md">
                  Watch raw silk drape, terracotta turn on pottery wheels, and master tailors measure. Tap to shop directly.
                </p>
              </div>
              <Link
                to="/shoppable-videos"
                className="text-sm font-semibold text-pink-200 hover:text-white flex items-center gap-1 shrink-0"
              >
                <span>Browse All Video Reels</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {videos.slice(0, 3).map((video) => (
                <div
                  key={video._id}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative aspect-4/5 rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-stone-800 border border-stone-700/80"
                >
                  <img
                    src={video.thumbnailUrl || video.videoUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-black/20" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-xl">
                      <Icons.Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Bottom Video Info */}
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-xs font-semibold text-white line-clamp-1">{video.title}</p>
                    <p className="text-[10px] text-stone-300 mt-0.5 font-mono">
                      ₹{video.product?.salePrice || video.product?.price || 0} • {video.views || 0} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Verified Artisan Partners Row ────────────────────────────────────── */}
      {shops.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Verified Artisan Studios</h2>
              <p className="text-sm text-stone-500 mt-1">Studios vetted for heritage craft authenticity, fair wages & escrow protection</p>
            </div>
            <Link to="/shops" className="text-sm font-semibold text-brand-primary hover:underline">
              View All Studios →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.slice(0, 2).map((shop) => (
              <div
                key={shop._id}
                onClick={() => navigate(`/shop/${shop.slug || shop._id}`)}
                className="p-6 rounded-3xl bg-white border border-[#f2d5e0] hover:border-brand-primary hover:shadow-xl hover:shadow-pink-900/5 transition-all cursor-pointer flex flex-col justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={shop.logoUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100'}
                    alt={shop.shopName || shop.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#f2d5e0] shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900">{shop.shopName || shop.name}</h3>
                      <span className="p-0.5 rounded-full bg-emerald-50 text-emerald-600" title="KYC Verified">
                        <Icons.CheckCircle className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      {shop.address?.city || shop.city || 'India'} • {shop.category}
                    </p>
                    <p className="text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                      {shop.description || 'Verified artisan studio handcrafting exceptional ethical goods.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#f2d5e0]/60 text-sm">
                  <div className="flex items-center gap-4 text-stone-500">
                    <span className="flex items-center gap-1 font-semibold text-stone-800">
                      <Icons.Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      {shop.rating?.average || shop.rating || 5.0} ({shop.rating?.count || shop.reviewsCount || 12} reviews)
                    </span>
                    <span>7-Day Returns</span>
                  </div>
                  <span className="text-sm font-semibold text-brand-primary flex items-center gap-1">
                    Visit Storefront <Icons.ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Bespoke Tailoring CTA Banner ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-50/80 via-[#fdf2f8] to-pink-100/50 border border-[#f2d5e0] p-6 sm:p-12">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-100 text-brand-primary text-xs sm:text-sm font-bold tracking-wide uppercase border border-pink-200">
              <Icons.Scissors className="w-4 h-4 text-brand-primary" />
              <span>Made-To-Measure Atelier</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              Need a Custom Measurement or Festive Fit?
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              Our partner master tailors handcraft bespoke linen waistcoats, sherwanis, and silk kurtas tailored to your exact chest, shoulder, and sleeve specifications.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setTailoringModalOpen(true)}
                className="px-6 py-3.5 rounded-full bg-brand-primary hover:bg-brand-primary text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span>Book Bespoke Fit Consultation</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <ShoppableVideoModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
      />

      {/* Tailoring Modal */}
      <TailoringModal
        isOpen={tailoringModalOpen}
        onClose={() => setTailoringModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
