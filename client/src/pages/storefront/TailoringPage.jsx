import React, { useState } from 'react';
import TailoringModal from '../../components/storefront/TailoringModal';
import Icons from '../../components/common/Icons';

export const TailoringPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="max-w-2xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
          <Icons.Scissors className="w-3.5 h-3.5" />
          Master Tailor Collective
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-slate-900 leading-tight">
          Bespoke Made-to-Measure & Precision Custom Fit
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Off-the-rack sizing rarely honors unique proportions. Our partner ateliers in Mumbai and Jaipur hand-draft individual paper patterns for your chest, waist, and shoulder stance.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <span>Schedule Custom Measurement Consultation</span>
          <Icons.ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* How it works 3-step grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center font-mono">
            01
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Submit Body Parameters</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Provide your chest, shoulder, waist, and desired garment drape. Or choose virtual video measurement with our master cutter.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
            02
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Fabric Weaving & Handcraft</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Crafted from 100% natural organic hand-spun linens, raw silks, and heritage brocades with hand-finished horn buttons.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center font-mono">
            03
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Guaranteed Perfect Fit</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Delivered directly to your door with complimentary alterations if needed within 14 days of delivery.
          </p>
        </div>
      </div>

      <TailoringModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default TailoringPage;
