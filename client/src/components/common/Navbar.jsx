import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/client';
import Icons from './Icons';

export const Navbar = () => {
  const { user, isSeller, isAdmin, logout, wishlist } = useAuth();
  const { totalCount, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const catRef = useRef(null);
  const userRef = useRef(null);

  // Live search debouncing against real backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      api.products.getAll({ q: searchQuery.trim(), limit: 5 }).then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSuggestions(res.data.slice(0, 5));
        }
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target) &&
          (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))) {
        setShowSearchSuggestions(false);
      }
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCategoriesDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchSuggestions(false);
    navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navCategories = [
    { label: 'Festive Deals', query: 'Deals', highlight: true, icon: '✨' },
    { label: 'Handloom Silks', query: 'Clothing' },
    { label: 'Studio Ceramics', query: 'Ceramics' },
    { label: 'Fine Jewellery', query: 'Jewelry' },
    { label: 'Bespoke Fit', path: '/tailoring' },
    { label: 'Shoppable Reels', path: '/shoppable-videos' },
    { label: 'Artisan Studios', path: '/shops' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#f2d5e0]">
      {/* ── Main Header ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-stone-700 hover:text-brand-primary rounded-xl hover:bg-pink-50 transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Icons.Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-1.5 shrink-0">
              <span className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-brand-primary">
                GalliKart
              </span>
            </Link>
          </div>

          {/* Desktop Categories Dropdown */}
          <div className="relative hidden lg:block shrink-0" ref={catRef}>
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-800 hover:text-brand-primary hover:bg-pink-50 rounded-full transition-colors cursor-pointer border border-pink-100 hover:border-pink-300"
            >
              <Icons.Menu className="w-4 h-4 text-brand-primary" />
              <span>Categories</span>
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 animate-fade-in text-xs font-medium text-stone-700">
                <Link
                  to="/browse?category=Clothing"
                  onClick={() => setCategoriesDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-pink-50/70 rounded-xl transition-colors"
                >
                  <span className="text-base">👘</span>
                  <div>
                    <p className="font-semibold text-stone-900">Handloom & Silks</p>
                    <p className="text-[10px] text-stone-400">Mulberry silks, khadi & linen</p>
                  </div>
                </Link>
                <Link
                  to="/browse?category=Jewelry"
                  onClick={() => setCategoriesDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-pink-50/70 rounded-xl transition-colors"
                >
                  <span className="text-base">💎</span>
                  <div>
                    <p className="font-semibold text-stone-900">Silver & Temple Jewellery</p>
                    <p className="text-[10px] text-stone-400">925 Filigree, silver & brass</p>
                  </div>
                </Link>
                <Link
                  to="/browse?category=Ceramics"
                  onClick={() => setCategoriesDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-pink-50/70 rounded-xl transition-colors"
                >
                  <span className="text-base">🏺</span>
                  <div>
                    <p className="font-semibold text-stone-900">Studio Ceramics & Kiln</p>
                    <p className="text-[10px] text-stone-400">Khurja stoneware & glazed pottery</p>
                  </div>
                </Link>
                <Link
                  to="/tailoring"
                  onClick={() => setCategoriesDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-pink-50/70 rounded-xl transition-colors"
                >
                  <span className="text-base">✂️</span>
                  <div>
                    <p className="font-semibold text-stone-900">Bespoke Made-to-Measure</p>
                    <p className="text-[10px] text-stone-400">Nehru jackets & custom fits</p>
                  </div>
                </Link>
                <div className="border-t border-pink-100 my-1 pt-1">
                  <Link
                    to="/browse"
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="block text-center py-2 text-xs font-semibold text-brand-primary hover:underline"
                  >
                    View All Departments →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-2xl relative hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search rare silks, ceramics, jewellery, tailors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                className="w-full h-11 pl-5 pr-12 text-sm sm:text-base bg-pink-50/40 border border-[#f2d5e0] rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand-primary focus:bg-white shadow-xs transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 w-9 h-9 rounded-full bg-brand-primary hover:bg-brand-primary text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer"
                title="Search"
              >
                <Icons.Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 animate-fade-in">
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-3 py-1.5">
                  Artisanal Pieces
                </div>
                {suggestions.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      setShowSearchSuggestions(false);
                      navigate(`/product/${p.slug || p._id}`);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-pink-50/70 rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-brand-primary font-mono font-bold">
                        ₹{p.discountedPrice || p.salePrice || p.price}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-brand-primary">View →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            
            {/* User Session */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:p-1.5 hover:bg-pink-50 rounded-full transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                    {user.name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-stone-900 hidden lg:inline max-w-[80px] truncate">
                    {user.name}
                  </span>
                  <Icons.ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden lg:inline" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 animate-fade-in text-xs">
                    <div className="p-2.5 border-b border-pink-100">
                      <p className="font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-brand-primary">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-stone-700 hover:bg-pink-50 rounded-xl"
                      >
                        <Icons.User className="w-4 h-4 text-brand-primary" />
                        <span>My Profile & Addresses</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-stone-700 hover:bg-pink-50 rounded-xl"
                      >
                        <Icons.Package className="w-4 h-4 text-brand-primary" />
                        <span>Orders & Deliveries</span>
                      </Link>
                      {isSeller && (
                        <Link
                          to="/vendor"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium"
                        >
                          <Icons.Store className="w-4 h-4 text-emerald-600" />
                          <span>Vendor Studio Panel</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-xl font-medium"
                        >
                          <Icons.ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-pink-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-medium cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Icons.User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* India Flag */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full hover:bg-pink-50 text-xs font-semibold text-stone-700" title="India (INR ₹)">
              <span className="text-base leading-none">🇮🇳</span>
              <span className="text-[11px] font-mono text-stone-600">₹</span>
            </div>

            {/* Wishlist */}
            <Link
              to="/account?tab=wishlist"
              className="relative p-2 rounded-full hover:bg-pink-50 text-stone-700 hover:text-brand-primary transition-colors"
              title="Saved Pieces"
            >
              <Icons.Heart className="w-5 h-5 stroke-[2]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-full hover:bg-pink-50 text-stone-800 hover:text-brand-primary transition-colors cursor-pointer"
              title="Bag"
            >
              <Icons.ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Dedicated Search Row (visible on mobile only) ───────────── */}
        <div className="sm:hidden pb-3 pt-1" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search silks, ceramics, jewellery..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              className="w-full h-10 pl-4 pr-11 text-xs bg-pink-50/60 border border-[#f2d5e0] rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand-primary focus:bg-white shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Icons.Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Sub-navigation Horizontal Category Bar ────────────────────────────── */}
      <div className="border-t border-[#f2d5e0]/60 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-2.5 text-sm font-semibold text-stone-700 whitespace-nowrap scrollbar-none">
            {navCategories.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  else navigate(`/browse?category=${encodeURIComponent(item.query)}`);
                }}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                  item.highlight
                    ? 'font-bold text-brand-primary bg-pink-50 border border-pink-200'
                    : 'hover:text-brand-primary hover:bg-pink-50/60'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile Slide-Over Navigation Drawer ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in border-r border-pink-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <span className="text-2xl font-serif font-black text-brand-primary">
                  GalliKart
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-pink-50 cursor-pointer"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-sm font-semibold text-stone-800">
                <Link
                  to="/browse"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-brand-primary"
                >
                  Explore Collection
                </Link>
                <Link
                  to="/shops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-brand-primary"
                >
                  Artisan Studios
                </Link>
                <Link
                  to="/shoppable-videos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-brand-primary"
                >
                  Shoppable Reels
                </Link>
                <Link
                  to="/tailoring"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-brand-primary"
                >
                  Bespoke Made-to-Measure
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-pink-50 hover:text-brand-primary"
                >
                  Track Sub-Orders
                </Link>
                <Link
                  to="/sell"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-pink-50 text-brand-primary"
                >
                  Become a Seller / Studio
                </Link>
              </div>
            </div>

            <div className="border-t border-pink-100 pt-4 space-y-3">
              {user ? (
                <div>
                  <p className="text-xs font-bold text-stone-900">{user.name}</p>
                  <p className="text-[11px] text-stone-400">{user.email}</p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="mt-3 w-full py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center bg-brand-primary text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
