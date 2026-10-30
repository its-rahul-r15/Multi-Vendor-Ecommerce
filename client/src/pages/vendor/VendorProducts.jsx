import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/Badge';
import Icons from '../../components/common/Icons';

export const VendorProducts = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Apparel & Wear',
    price: '',
    salePrice: '',
    stock: 10,
    sizes: 'S, M, L, XL',
    colors: 'Natural, Indigo, Charcoal',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
  });

  const fetchProducts = async () => {
    let res = await api.products.getMyProducts();
    if (!res.success || !res.data || res.data.length === 0) {
      res = await api.products.getAll({ limit: 50 });
    }
    if (res.success && res.data) {
      setProducts(Array.isArray(res.data) ? res.data : []);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      salePrice: Number(form.salePrice || form.price),
      discountedPrice: Number(form.salePrice || form.price),
      stock: Number(form.stock),
      sizes: form.sizes.split(',').map((s) => s.trim()),
      colors: form.colors.split(',').map((c) => c.trim()),
      images: [form.imageUrl],
    };

    if (editingProduct) {
      const res = await api.products.update(editingProduct._id, payload);
      if (res.success) {
        success('Product updated successfully');
        setShowAddModal(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        error(res.error || 'Failed to update product');
      }
    } else {
      const res = await api.products.create(payload);
      if (res.success) {
        success('New product created and listed!');
        setShowAddModal(false);
        fetchProducts();
      } else {
        error(res.error || 'Failed to create product');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this piece from your catalog?')) return;
    const res = await api.products.delete(id);
    if (res.success) {
      success('Piece removed from store');
      fetchProducts();
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Artisanal Studio Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your listings, stock inventory and variant specifications
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setForm({
              name: '',
              description: '',
              category: 'Apparel & Wear',
              price: '',
              salePrice: '',
              stock: 10,
              sizes: 'S, M, L, XL',
              colors: 'Natural, Indigo, Charcoal',
              imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-1 text-xs">
        {['all', 'active', 'pending_review', 'draft'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-all border-b-2 -mb-1 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400">
              <th className="p-4">Item & Details</th>
              <th className="p-4">Department</th>
              <th className="p-4 font-mono">Retail Price</th>
              <th className="p-4 font-mono">Stock Units</th>
              <th className="p-4">Moderation</th>
              <th className="p-4 text-right">Actions</th>
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
                      <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku || 'AURA-SKU-01'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{p.category}</td>
                <td className="p-4 font-mono font-bold text-slate-900">
                  {formatCurrency(p.salePrice || p.price)}
                </td>
                <td className="p-4">
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                      p.stock < 10 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.stock} units
                  </span>
                </td>
                <td className="p-4">
                  <StatusBadge status={p.status || 'active'} />
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setForm({
                        name: p.name,
                        description: p.description,
                        category: p.category,
                        price: p.price,
                        salePrice: p.salePrice || p.price,
                        stock: p.stock,
                        sizes: (p.sizes || []).join(', '),
                        colors: (p.colors || []).join(', '),
                        imageUrl: p.images?.[0] || '',
                      });
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                  >
                    <Icons.Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingProduct ? 'Edit Creation' : 'Publish New Creation'}
        subtitle="Submitted products are reviewed by platform curators within 24 hours"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Creation Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Handwoven Mulberry Silk Shawl"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Department</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option>Apparel & Wear</option>
                <option>Minimalist Living</option>
                <option>Ceramics & Decor</option>
                <option>Custom Tailoring</option>
                <option>Leather Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Initial Stock Units</label>
              <input
                type="number"
                required
                min="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">MRP Base Price (₹)</label>
              <input
                type="number"
                required
                placeholder="2999"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Sale Discounted Price (₹)</label>
              <input
                type="number"
                placeholder="2499"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Image URL (Unsplash or Cloudinary)</label>
            <input
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Sizes (comma-separated)</label>
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Shades (comma-separated)</label>
              <input
                type="text"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Artisanal Story & Details</label>
            <textarea
              rows="3"
              required
              placeholder="Describe origin weave, dyes, materials, and washing care..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-sm"
            >
              {editingProduct ? 'Save Updates' : 'Submit for Moderation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorProducts;
