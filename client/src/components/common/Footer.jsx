import React from 'react';
import { Link } from '../../router/Router';
import Icons from './Icons';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#f2d5e0] text-stone-600 text-xs">
      {/* Trust & Guarantee Strip */}
      <div className="border-b border-[#f2d5e0] py-6 sm:py-8 bg-[#fdf2f8]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#f2d5e0] flex items-center justify-center text-brand-primary shrink-0 shadow-xs">
              <Icons.ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">Escrow Protected</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Vendors paid post 7-day return</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#f2d5e0] flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
              <Icons.Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">Tracked Dispatch</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Live carrier tracking on BlueDart</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#f2d5e0] flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <Icons.RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">7-Day Free Returns</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Hassle-free direct gateway refund</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#f2d5e0] flex items-center justify-center text-brand-primary shrink-0 shadow-xs">
              <Icons.FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">GST Tax Invoices</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Instant PDF invoice download</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                G
              </div>
              <span className="text-xl font-bold tracking-tight text-brand-primary font-serif">
                GalliKart
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              India's premier curated multi-vendor marketplace connecting conscious shoppers with independent handloom weavers, studio potters, and bespoke master tailors.
            </p>
            <div className="pt-2 text-[11px] text-stone-400">
              Verified Marketplace Architecture compliant with Razorpay Route, TDS/TCS & GST regulations.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><Link to="/browse" className="hover:text-brand-primary">All Products</Link></li>
              <li><Link to="/shops" className="hover:text-brand-primary">Artisan Shops</Link></li>
              <li><Link to="/shoppable-videos" className="hover:text-brand-primary">Video Lookbooks</Link></li>
              <li><Link to="/tailoring" className="hover:text-brand-primary">Custom Tailoring</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><Link to="/vendor" className="hover:text-brand-primary">Vendor Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-brand-primary">Admin Control Center</Link></li>
              <li><Link to="/sell" className="hover:text-brand-primary">Become a Seller</Link></li>
              <li><Link to="/orders" className="hover:text-brand-primary">Track Sub-Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              Newsletter
            </h4>
            <p className="text-xs text-stone-500 mb-2">
              Receive notifications about limited artisan studio batch drops.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to curated drops!'); }} className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                className="w-full py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary transition-all cursor-pointer shadow-xs"
              >
                Subscribe to Drops
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© 2026 GalliKart Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer">Vendor Escrow Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
