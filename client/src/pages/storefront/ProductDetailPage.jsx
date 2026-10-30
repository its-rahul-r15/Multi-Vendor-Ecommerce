import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from '../../router/Router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, api } from '../../api/client';
import Modal from '../../components/common/Modal';
import ProductCard from '../../components/storefront/ProductCard';
import Icons from '../../components/common/Icons';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Standard');
  const [quantity, setQuantity] = useState(1);
  const [show360Modal, setShow360Modal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product and associated reviews from backend
  useEffect(() => {
    let mounted = true;
    async function loadProductData() {
      setLoading(true);
      try {
        const res = await api.products.getById(id);
        if (mounted && res.success && res.data) {
          const prod = res.data;
          setProduct(prod);
          setActiveImageIndex(0);
          setSelectedSize(prod.sizes?.[0] || 'M');
          setSelectedColor(prod.colors?.[0] || 'Standard');

          // Fetch reviews and related products
          const [revRes, relRes] = await Promise.allSettled([
            api.reviews.getByProduct(prod._id),
            api.products.getAll({ category: prod.category, limit: 4 }),
          ]);

          if (mounted) {
            if (revRes.status === 'fulfilled' && revRes.value?.success) {
              setReviews(Array.isArray(revRes.value.data) ? revRes.value.data : []);
            }
            if (relRes.status === 'fulfilled' && relRes.value?.success) {
              const list = Array.isArray(relRes.value.data) ? relRes.value.data : [];
              setRelatedProducts(list.filter((p) => p._id !== prod._id).slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) {
      loadProductData();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-pulse">
          <div className="lg:col-span-7 aspect-4/5 rounded-3xl bg-slate-100 border border-slate-200" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-6 w-32 bg-slate-100 rounded" />
            <div className="h-10 w-3/4 bg-slate-100 rounded" />
            <div className="h-8 w-24 bg-slate-100 rounded" />
            <div className="h-24 w-full bg-slate-100 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Icons.Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif">Product Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested product may have been archived or is no longer listed by the artisan.
        </p>
        <button
          onClick={() => navigate('/browse')}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isSaved = wishlist.includes(product._id);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'];

  const salePrice = product.discountedPrice || product.salePrice;
  const regularPrice = product.price || 0;
  const effectivePrice = salePrice || regularPrice;
  const discountPercent = regularPrice > effectivePrice
    ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, { size: selectedSize, color: selectedColor });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, { size: selectedSize, color: selectedColor });
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.reviews.create(product._id, {
        userName: user?.name || 'Verified Buyer',
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      if (res.success) {
        setReviews([res.data || reviewForm, ...reviews]);
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
        success('Review submitted successfully');
      } else {
        toastError(res.error || 'Failed to submit review');
      }
    } catch (err) {
      toastError(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* ── Main Product Presentation Section ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-indigo-600 shadow-md' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Selected Image */}
          <div className="relative flex-1 aspect-4/5 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discountPercent > 0 && (
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-rose-500 text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
              {product.has360 && (
                <button
                  onClick={() => setShow360Modal(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-900 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Icons.Eye360 className="w-4 h-4 text-indigo-400" />
                  <span>360° Studio View</span>
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                isSaved ? 'bg-rose-50 text-rose-500 fill-rose-500' : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
              }`}
            >
              <Icons.Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Buy Box & Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Vendor & Rating */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <Link
                to={`/shop/${product.shop?.slug || product.shopId?._id || product.shopId || 'aura-studio'}`}
                className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Icons.Store className="w-3.5 h-3.5" />
                <span>{product.shop?.shopName || product.shop?.name || product.shopId?.shopName || 'Artisan Studio'}</span>
              </Link>
              <div className="flex items-center gap-1 font-medium text-slate-800">
                <Icons.Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{product.rating?.average || product.rating || 5.0}</span>
                <span className="text-slate-400">({product.rating?.count || reviews.length} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="mt-3 flex items-baseline gap-3 font-mono">
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(effectivePrice)}
              </span>
              {regularPrice > effectivePrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(regularPrice)}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-sans">
                Tax Included (GST)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-900">Select Finish / Shade</span>
                <span className="text-slate-500">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size / Dimension Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-900">Select Dimension / Size</span>
                <span className="text-slate-500">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Indicator */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-900">Order Quantity</span>
              <span className={`font-medium ${product.stock > 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {product.stock > 0 ? `${product.stock} units in atelier` : 'Out of stock'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Icons.Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-semibold font-mono text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Icons.Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-900 text-slate-900 hover:bg-slate-50 font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Icons.ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>Instant Checkout</span>
                  <Icons.ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-Vendor Escrow Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>7-Day Return Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Truck className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Direct Studio Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Tag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>100% Verified Authentic</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 pt-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Customer Experiences</h2>
            <p className="text-xs text-slate-500">Verified buyer appraisals and craftsmanship ratings</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Write an Appraisal
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r, i) => (
              <div key={r._id || i} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                      {(r.userName || r.user?.name || 'A')[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{r.userName || r.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Verified Buyer'}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, s) => (
                      <Icons.Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s < (r.rating || 5) ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment || r.review}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No appraisals yet for this piece. Be the first to review!
          </div>
        )}
      </section>

      {/* ── Related Products ─────────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-100 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif">Complementary Atelier Creations</h2>
            <Link to="/browse" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 360 Degree Viewer Modal */}
      <Modal isOpen={show360Modal} onClose={() => setShow360Modal(false)} title="Interactive 360° Studio View">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src={images[0]}
              alt="360 view"
              className="w-full h-full object-contain filter contrast-105"
            />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium flex items-center gap-2">
                <Icons.Eye360 className="w-4 h-4 text-indigo-300 animate-spin" />
                <span>Drag horizontally to rotate specimen</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Inspected under studio balanced lighting. Raw organic grain and pigment texture visible.
          </p>
        </div>
      </Modal>

      {/* Write Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Submit Piece Appraisal">
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Craftsmanship Score</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="p-1 text-amber-500 focus:outline-none cursor-pointer"
                >
                  <Icons.Star
                    className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-current' : 'text-slate-200'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Remarks</label>
            <textarea
              rows={4}
              required
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Describe the tactile feel, finish, fit, and artisanal quality..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {submittingReview ? 'Submitting...' : 'Post Appraisal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
