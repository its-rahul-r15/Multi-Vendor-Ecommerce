import React from 'react';
import { useNavigate } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../api/client';
import Icons from '../common/Icons';

export const ProductCard = ({ product }) => {
  const { wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isSaved = wishlist.includes(product._id);
  const regularPrice = product.price || 0;
  const salePrice = product.discountedPrice || product.salePrice;
  const effectivePrice = salePrice || regularPrice;
  const discountPercent = regularPrice > effectivePrice
    ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
    : 0;

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#f2d5e0] hover:border-brand-primary hover:shadow-xl hover:shadow-pink-900/5 transition-all duration-300 cursor-pointer"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-pink-50/30">
        <img
          src={product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer ${
            isSaved
              ? 'bg-pink-50 text-brand-primary fill-brand-primary border border-pink-200'
              : 'bg-white/90 text-stone-600 hover:text-brand-primary hover:bg-white border border-stone-200/50'
          }`}
          title="Save to Wishlist"
        >
          <Icons.Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Feature Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-md bg-brand-primary text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.has360 && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-stone-900/85 backdrop-blur-xs text-white flex items-center gap-1 shadow-xs">
              <Icons.Eye360 className="w-3.5 h-3.5 text-pink-300" />
              360°
            </span>
          )}
        </div>

        {/* Quick Add Overlay on hover (desktop) */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 rounded-xl bg-white/95 backdrop-blur-md text-stone-900 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
          >
            <Icons.ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white space-y-2">
        <div>
          {/* Shop / Vendor info */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold text-stone-600 truncate max-w-[140px] hover:text-brand-primary">
              {product.shop?.shopName || product.shop?.name || product.shopId?.shopName || 'Artisan Atelier'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Icons.Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span className="text-xs text-stone-800">{product.rating?.average || product.rating || '4.9'}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold text-stone-900 line-clamp-2 group-hover:text-brand-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Stock & Mobile Quick Add */}
        <div className="pt-2.5 border-t border-pink-100/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-base sm:text-lg font-bold text-stone-950">
              {formatCurrency(effectivePrice)}
            </span>
            {regularPrice > effectivePrice && (
              <span className="text-xs sm:text-sm text-stone-400 line-through">
                {formatCurrency(regularPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              In Stock
            </span>
            <button
              onClick={handleAddToCart}
              className="sm:hidden p-1.5 rounded-lg bg-pink-50 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
              title="Add to cart"
            >
              <Icons.ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
