import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import StatusBadge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Icons from '../../components/common/Icons';

export const AdminShops = () => {
  const { success, error } = useToast();
  const [shops, setShops] = useState([]);
  const [editingCommissionShop, setEditingCommissionShop] = useState(null);
  const [commissionBps, setCommissionBps] = useState(800);

  const fetchShops = async () => {
    const res = await api.shops.getAll();
    if (res.success && res.data) setShops(res.data);
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (shopId) => {
    const res = await api.shops.approveShop(shopId);
    if (res.success) {
      success('Shop and KYC verification approved!');
      fetchShops();
    }
  };

  const handleReject = async (shopId) => {
    const res = await api.shops.rejectShop(shopId);
    if (res.success) {
      success('Shop application rejected.');
      fetchShops();
    }
  };

  const handleToggleBlock = async (shopId) => {
    const res = await api.shops.toggleBlock(shopId);
    if (res.success) {
      success('Shop status toggled.');
      fetchShops();
    }
  };

  const handleSaveCommission = (e) => {
    e.preventDefault();
    setShops(
      shops.map((s) =>
        s._id === editingCommissionShop._id ? { ...s, commissionBps: Number(commissionBps) } : s
      )
    );
    success(`Commission updated to ${(commissionBps / 100).toFixed(1)}%`);
    setEditingCommissionShop(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Artisan Studios & KYC Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review business registration, verify PAN/GSTIN, and configure individual commission take-rates
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400">
              <th className="p-4">Studio / Brand</th>
              <th className="p-4">Location</th>
              <th className="p-4">KYC Status</th>
              <th className="p-4 font-mono">Commission</th>
              <th className="p-4 font-mono">Ledger Balance</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shops.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">ID: {s._id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{s.city}, India</td>
                <td className="p-4">
                  <StatusBadge status={s.kycStatus || s.status} />
                </td>
                <td className="p-4 font-mono font-bold text-slate-900">
                  <button
                    onClick={() => {
                      setEditingCommissionShop(s);
                      setCommissionBps(s.commissionBps || 800);
                    }}
                    className="hover:underline flex items-center gap-1 text-indigo-600"
                  >
                    <span>{((s.commissionBps || 800) / 100).toFixed(1)}%</span>
                    <Icons.Edit className="w-3 h-3 text-slate-400" />
                  </button>
                </td>
                <td className="p-4 font-mono text-slate-700">
                  {formatCurrency(s.balance || 42500)}
                </td>
                <td className="p-4 text-right space-x-2">
                  {s.status !== 'approved' ? (
                    <>
                      <button
                        onClick={() => handleApprove(s._id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        Approve KYC
                      </button>
                      <button
                        onClick={() => handleReject(s._id)}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleBlock(s._id)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        s.isBlocked
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {s.isBlocked ? 'Unblock' : 'Block Studio'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Commission Modal */}
      <Modal
        isOpen={Boolean(editingCommissionShop)}
        onClose={() => setEditingCommissionShop(null)}
        title="Configure Platform Take-Rate"
        subtitle={`Studio: ${editingCommissionShop?.name}`}
      >
        <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Commission in Basis Points (100 bps = 1.0%)
            </label>
            <input
              type="number"
              required
              min="0"
              max="3000"
              value={commissionBps}
              onChange={(e) => setCommissionBps(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Currently equates to: <span className="font-bold text-slate-900">{(commissionBps / 100).toFixed(2)}%</span>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingCommissionShop(null)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-sm"
            >
              Save Rate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminShops;
