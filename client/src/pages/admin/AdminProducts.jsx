import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import StatusBadge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Icons from '../../components/common/Icons';

export const AdminProducts = () => {
  const { success } = useToast();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchProducts = async () => {
    const res = await api.products.getAll();
    if (res.success && res.data) setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApproveProduct = async (id) => {
    await api.products.update(id, { status: 'active' });
    success('Creation approved and published to storefront!');
    fetchProducts();
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    await api.products.update(rejectingProduct._id, {
      status: 'rejected',
      moderationNote: rejectNote,
    });
    success('Creation rejected. Feedback sent to artisan.');
    setRejectingProduct(null);
    setRejectNote('');
    fetchProducts();
  };

  const handleToggleFeatured = async (id) => {
    await api.products.toggleFeatured(id);
    success('Featured status toggled');
    fetchProducts();
  };

  const handleToggleBan = async (id) => {
    await api.products.toggleBan(id);
    success('Product ban status updated');
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return p.status === 'pending_review';
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'banned') return p.isBanned;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Artisanal Product Moderation Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review new vendor creation submissions, verify photography standards, and feature curated works
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-1 text-xs">
        {['all', 'pending', 'active', 'banned'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-all border-b-2 -mb-1 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400">
              <th className="p-4">Piece & Vendor</th>
              <th className="p-4">Category</th>
              <th className="p-4 font-mono">Retail Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-indigo-600 font-medium">{p.shop?.name || 'Aura Studio'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{p.category}</td>
                <td className="p-4 font-mono font-bold text-slate-900">
                  {formatCurrency(p.salePrice || p.price)}
                </td>
                <td className="p-4">
                  {p.isBanned ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      Banned
                    </span>
                  ) : (
                    <StatusBadge status={p.status || 'active'} />
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleFeatured(p._id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      p.isFeatured
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title="Toggle featured status on Home"
                  >
                    <Icons.Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                  {p.status === 'pending_review' ? (
                    <>
                      <button
                        onClick={() => handleApproveProduct(p._id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectingProduct(p);
                          setRejectNote('High resolution studio photography required');
                        }}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleBan(p._id)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        p.isBanned
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      {p.isBanned ? 'Unban' : 'Ban Item'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingProduct)}
        onClose={() => setRejectingProduct(null)}
        title="Moderation Feedback & Rejection Note"
        subtitle={`Piece: ${rejectingProduct?.name}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Reason for Rejection</label>
            <textarea
              rows="3"
              required
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectingProduct(null)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-sm"
            >
              Send Rejection Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
