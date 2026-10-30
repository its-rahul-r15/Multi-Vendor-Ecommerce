import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../../router/Router';
import Icons from '../common/Icons';

export const HeroBannerCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = [
    {
      id: 'festive-silks',
      badge: 'FESTIVE ATELIER DROP • UP TO 50% OFF',
      badgeColor: 'bg-orange-100 text-brand-primary border-orange-200',
      title: 'Rare Handwoven Silks & Chanderi Heirloom Sarees',
      subtitle: 'Sourced directly from certified master weavers of Varanasi and Maheshwar. Protected with multi-vendor escrow.',
      ctaText: 'Shop Festive Silks',
      ctaLink: '/browse?category=Clothing',
      secondaryText: 'Code: FESTIVE50',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
      accentColor: 'from-amber-950/80 via-stone-900/60 to-transparent',
    },
    {
      id: 'studio-ceramics',
      badge: 'DIRECT KILN DISPATCH • FLAT 30% OFF',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'Hand-Thrown Studio Ceramics & Khurja Stoneware',
      subtitle: 'Minimalist glazed dinnerware, artisanal tea ceramics, and terracotta vases hand-crafted in independent pottery studios.',
      ctaText: 'Explore Pottery & Kiln',
      ctaLink: '/browse?category=Ceramics',
      secondaryText: 'Free Shipping > ₹1,500',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1600&auto=format&fit=crop&q=80',
      accentColor: 'from-stone-950/80 via-stone-900/60 to-transparent',
    },
    {
      id: 'bespoke-tailoring',
      badge: 'MASTER TAILOR ATELIER • ₹0 CONSULTATION',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Made-To-Measure Linen Waistcoats & Sherwanis',
      subtitle: 'Precision chest, shoulder, and sleeve bespoke fittings crafted for celebratory festive wardrobes.',
      ctaText: 'Book Custom Fitting',
      ctaLink: '/tailoring',
      secondaryText: '7-Day Alteration Promise',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&auto=format&fit=crop&q=80',
      accentColor: 'from-slate-950/80 via-slate-900/60 to-transparent',
    },
    {
      id: 'silver-jewellery',
      badge: 'HALLMARKED 925 SILVER • FLASH ARTISAN DEAL',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      title: 'Cuttack Silver Filigree & Heritage Temple Ornaments',
      subtitle: 'Intricate 500-year-old Tarakasi filigree silver jewellery with hallmark purity certificate & insured delivery.',
      ctaText: 'Discover Fine Silver',
      ctaLink: '/browse?category=Jewelry',
      secondaryText: 'Artisan Authenticity Certified',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&auto=format&fit=crop&q=80',
      accentColor: 'from-stone-950/80 via-stone-900/60 to-transparent',
    },
  ];

  // Auto-scroll effect: every 4.5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support for mobile devices
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext(); // swiped left
      } else {
        handlePrev(); // swiped right
      }
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-950 shadow-md group border border-[#f2d5e0]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative h-[360px] sm:h-[420px] lg:h-[460px] w-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Photography */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
              />

              {/* Gradient Overlay for high-contrast readable typography */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-stone-950/20" />

              {/* Banner Text & Deal Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-12 lg:px-16 max-w-2xl sm:max-w-3xl text-left space-y-3 sm:space-y-4">
                {/* Promo Badge */}
                <div className="inline-flex items-center gap-2">
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-pink-200/40 bg-pink-900/60 text-pink-200 backdrop-blur-md">
                    {slide.badge}
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight leading-snug sm:leading-[1.15]">
                  {slide.title}
                </h2>

                {/* Subtitle / Deal Description */}
                <p className="text-sm sm:text-base text-stone-200 line-clamp-2 sm:line-clamp-none max-w-xl leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* CTA Action Buttons */}
                <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={() => navigate(slide.ctaLink)}
                    className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-brand-primary text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
                  >
                    <span>{slide.ctaText}</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="px-4 py-2.5 sm:px-4 sm:py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs sm:text-sm border border-white/30 flex items-center gap-1.5">
                    <Icons.Tag className="w-3.5 h-3.5 text-pink-300" />
                    <span>{slide.secondaryText}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left / Right Chevron Controls - touch-friendly, visible on hover desktop, subtle on mobile */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 cursor-pointer"
        aria-label="Previous Slide"
      >
        <Icons.ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 cursor-pointer"
        aria-label="Next Slide"
      >
        <Icons.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
      </button>

      {/* Bottom Dot Indicators */}
      <div className="absolute bottom-4 sm:bottom-5 inset-x-0 z-20 flex items-center justify-center gap-1.5 sm:gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-brand-primary'
                : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerCarousel;
