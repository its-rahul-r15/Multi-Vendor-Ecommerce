import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import Icons from '../common/Icons';

export const TailoringModal = ({ isOpen, onClose, defaultShop }) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    garmentType: 'Nehru Waistcoat',
    chest: '',
    waist: '',
    shoulder: '',
    length: '',
    notes: '',
    preferredFabric: 'Organic Handspun Linen',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.tailoring.submit(formData);
      if (res.success) {
        success(res.message || 'Custom tailoring request submitted!');
        onClose();
      } else {
        error(res.error || 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bespoke Custom Fit Request"
      subtitle="Crafted by master tailors with personalized fitting guarantee"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Garment Type</label>
            <select
              value={formData.garmentType}
              onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option>Nehru Waistcoat</option>
              <option>Raw Silk Kimono Robe</option>
              <option>Khadi Button-Down Shirt</option>
              <option>Sherwani / Bandhgala</option>
              <option>Pleated Linen Trousers</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Fabric Preference</label>
            <input
              type="text"
              value={formData.preferredFabric}
              onChange={(e) => setFormData({ ...formData, preferredFabric: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Measurements Grid */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
          <span className="block font-semibold text-slate-900 text-xs">
            Body Measurements (Inches)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Chest</label>
              <input
                type="text"
                placeholder='e.g. 40"'
                required
                value={formData.chest}
                onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Waist</label>
              <input
                type="text"
                placeholder='e.g. 34"'
                required
                value={formData.waist}
                onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Shoulder</label>
              <input
                type="text"
                placeholder='e.g. 18"'
                required
                value={formData.shoulder}
                onChange={(e) => setFormData({ ...formData, shoulder: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Length</label>
              <input
                type="text"
                placeholder='e.g. 29"'
                required
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Styling / Fit Instructions
          </label>
          <textarea
            rows="3"
            placeholder="Specify collar type, lining material, or custom pocket placements..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors font-medium flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Icons.Scissors className="w-3.5 h-3.5" />
            <span>{loading ? 'Submitting...' : 'Submit Custom Request'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TailoringModal;
