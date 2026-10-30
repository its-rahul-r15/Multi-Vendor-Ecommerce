import React, { useState } from 'react';
import { useNavigate } from '../../router/Router';
import Icons from '../common/Icons';

export const VisualCategoryRow = ({ onCategorySelect, selectedCategory }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const curatedCategories = [
    {
      id: 'clothing',
      title: 'Handloom Silks',
      categoryQuery: 'Clothing',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'ceramics',
      title: 'Studio Pottery',
      categoryQuery: 'Ceramics',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'jewelry',
      title: 'Silver Jewellery',
      categoryQuery: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'tailoring',
      title: 'Bespoke Fit',
      path: '/tailoring',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'decor',
      title: 'Terracotta Decor',
      categoryQuery: 'Other',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'shawls',
      title: 'Pashmina Shawls',
      categoryQuery: 'Clothing',
      image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'woodcraft',
      title: 'Hand Carved Wood',
      categoryQuery: 'Other',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'brass',
      title: 'Dhokra & Brass',
      categoryQuery: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'textiles',
      title: 'Block Print Linen',
      categoryQuery: 'Clothing',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'tea-pottery',
      title: 'Artisan Tea Sets',
      categoryQuery: 'Ceramics',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const visibleItems = showAll ? curatedCategories : curatedCategories.slice(0, 6);
  const remainingCount = curatedCategories.length - 6;

  const handleClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (onCategorySelect) {
      onCategorySelect(item.categoryQuery);
    } else {
      navigate(`/browse?category=${encodeURIComponent(item.categoryQuery)}`);
    }
  };

  return (
    <section className="space-y-6">
      {/* Breadcrumb & Section Header */}
      <div className="text-center space-y-1.5">
        <p className="text-xs sm:text-sm font-bold text-brand-primary uppercase tracking-widest">
          Curated Atelier Craft • Certified Regional Guilds
        </p>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Explore by Atelier Craft
        </h2>
      </div>

      {/* Categories Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 pt-2">
        {visibleItems.map((item) => {
          const isSelected = selectedCategory === item.categoryQuery;
          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="group cursor-pointer flex flex-col items-center text-center space-y-2.5 transition-all"
            >
              {/* Card Photo Container */}
              <div
                className={`relative w-full aspect-4/5 rounded-2xl overflow-hidden bg-pink-50/60 border border-[#f2d5e0]/70 transition-all duration-300 shadow-xs group-hover:shadow-lg ${
                  isSelected ? 'ring-3 ring-brand-primary ring-offset-2' : 'group-hover:scale-[1.03] group-hover:border-brand-primary'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Title below photo */}
              <h3 className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-brand-primary transition-colors leading-tight">
                {item.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* "Show more" pill button */}
      {!showAll && remainingCount > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2.5 rounded-full border border-[#f2d5e0] bg-white hover:bg-pink-50 text-stone-900 font-semibold text-sm shadow-xs transition-all hover:border-brand-primary hover:text-brand-primary cursor-pointer flex items-center gap-1.5"
          >
            <span>Show more ({remainingCount})</span>
            <Icons.ChevronDown className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      )}

      {showAll && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(false)}
            className="px-6 py-2.5 rounded-full border border-[#f2d5e0] bg-white hover:bg-pink-50 text-stone-700 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Show less</span>
            <Icons.ChevronUp className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      )}
    </section>
  );
};

export default VisualCategoryRow;
