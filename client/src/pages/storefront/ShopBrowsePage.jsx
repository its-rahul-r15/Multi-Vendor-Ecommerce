import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from '../../router/Router';
import { api } from '../../api/client';
import ProductCard from '../../components/storefront/ProductCard';
import VisualCategoryRow from '../../components/storefront/VisualCategoryRow';
import Icons from '../../components/common/Icons';

export const ShopBrowsePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryCategory = location.searchParams.get('category') || 'All';
  const querySearch = location.searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    const cat = location.searchParams.get('category') || 'All';
    const q = location.searchParams.get('q') || '';
    setSelectedCategory(cat);
    setSearchTerm(q);
  }, [location.search]);

  // Load categories and products from backend
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.products.getAll({ limit: 100 }),
          api.categories.getAll(),
        ]);

        if (mounted) {
          if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
            setProducts(Array.isArray(prodRes.value.data) ? prodRes.value.data : []);
          }
          if (catRes.status === 'fulfilled' && catRes.value?.success) {
            setCategories(Array.isArray(catRes.value.data) ? catRes.value.data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load products/categories:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter products client-side over backend items
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((p) =>
        (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }

    if (onlyInStock) {
      result = result.filter((p) => (p.stock || 0) > 0);
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating?.average || b.rating || 0) - (a.rating?.average || a.rating || 0));
    }

    return result;
  }, [products, selectedCategory, searchTerm, onlyInStock, sortBy]);

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    const qs = catName === 'All' ? '' : `?category=${encodeURIComponent(catName)}`;
    navigate(`/browse${qs}`, { replace: true, preventScrollReset: true });
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setSortBy('featured');
    setOnlyInStock(false);
    navigate('/browse', { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Marketplace Catalog
          </span>
          <h1 className="text-3xl font-bold text-stone-900 font-serif mt-1">
            {selectedCategory === 'All' ? 'Curated Artisanal Collection' : selectedCategory}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing {filteredProducts.length} authentic pieces directly from independent partner studios
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search within collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-8 bg-white border border-stone-300 rounded-full focus:outline-none focus:border-brand-primary shadow-xs"
          />
          <Icons.Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Category Cards Carousel */}
      <VisualCategoryRow
        onCategorySelect={handleCategoryClick}
        selectedCategory={selectedCategory}
      />

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Pieces
          </button>
          {categories.map((c) => {
            const name = c.name || c;
            return (
              <button
                key={c._id || name}
                onClick={() => handleCategoryClick(name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === name
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Controls: Stock toggle and Sort */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>In-Stock Only</span>
          </label>

          <div className="h-4 w-px bg-slate-200" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="featured">Featured Order</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(selectedCategory !== 'All' || searchTerm || onlyInStock) && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Active filters:</span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
              Department: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="hover:text-indigo-900 cursor-pointer">
                <Icons.X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
              "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:text-slate-900 cursor-pointer">
                <Icons.X className="w-3 h-3" />
              </button>
            </span>
          )}
          {onlyInStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
              In Stock Only
              <button onClick={() => setOnlyInStock(false)} className="hover:text-emerald-900 cursor-pointer">
                <Icons.X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Icons.Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900 font-serif">No products matched your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your category selection, removing the search keyword, or clearing the in-stock filter.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopBrowsePage;
