import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { useNavigate } from '../../router/Router';
import { formatCurrency } from '../../api/client';
import Icons from '../common/Icons';

export const ShoppableVideoModal = ({ isOpen, onClose, video }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);

  if (!video) return null;

  const product = video.product;

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 1);
      onClose();
    }
  };

  const handleViewProduct = () => {
    if (product) {
      onClose();
      navigate(`/product/${product.slug || product._id}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shoppable Reel" maxWidth="max-w-xl">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Video Player */}
        <div className="relative w-full md:w-3/5 aspect-9/16 bg-black rounded-xl overflow-hidden shadow-md">
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Social Stats Pill */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px]">
            <span className="flex items-center gap-1">
              <Icons.Eye className="w-3.5 h-3.5 text-slate-300" />
              {video.views}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icons.Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              {video.likes}
            </span>
          </div>
        </div>

        {/* Product Details & Direct Buy */}
        <div className="w-full md:w-2/5 flex flex-col justify-between self-stretch py-2">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-2">
              Featured In Video
            </span>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
              {product?.name || video.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-3">
              {product?.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatCurrency(product?.salePrice || product?.price || 2999)}
              </span>
              {product?.salePrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Icons.ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>
            <button
              onClick={handleViewProduct}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
            >
              View Full Product
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShoppableVideoModal;
