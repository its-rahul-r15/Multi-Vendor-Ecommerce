import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../api/client';
import api from '../../api/client';
import Modal from '../../components/common/Modal';
import Icons from '../../components/common/Icons';

export const VendorEarnings = () => {
  const { success, error } = useToast();
  const [ledger, setLedger] = useState([]);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('38200');

  useEffect(() => {
    api.admin.getLedger().then((res) => {
      if (res.success && res.data) setLedger(res.data);
    });
  }, []);

  const handleRequestPayout = (e) => {
    e.preventDefault();
    success(`Payout request of ₹${payoutAmount} queued for automated Razorpay Route settlement.`);
    setPayoutModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Earnings & Ledger Settlement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Append-only ledger balance according to Razorpay Route multi-vendor escrow rules
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available For Payout
          </span>
          <div className="text-3xl font-bold font-mono text-emerald-600">
            {formatCurrency(38200)}
          </div>
          <p className="text-[11px] text-slate-500">7-day customer return window elapsed</p>
          <button
            onClick={() => setPayoutModalOpen(true)}
            className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Withdraw to Linked Bank
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending Escrow Hold
          </span>
          <div className="text-3xl font-bold font-mono text-amber-600">
            {formatCurrency(4300)}
          </div>
          <p className="text-[11px] text-slate-500">Reserved until active courier delivery + 7 days</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Commission (8%)
          </span>
          <div className="text-3xl font-bold font-mono text-slate-700">
            {formatCurrency(3400)}
          </div>
          <p className="text-[11px] text-slate-500">TDS/TCS and payment gateway fees included</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold font-serif text-slate-900">
          Append-Only Financial Ledger Entries
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                <th className="pb-3">Date</th>
                <th className="pb-3">Transaction Description</th>
                <th className="pb-3">Entry Type</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {ledger.map((entry) => (
                <tr key={entry._id} className="text-xs hover:bg-slate-50/50">
                  <td className="py-3 text-slate-500 font-sans">{entry.date}</td>
                  <td className="py-3 font-sans font-medium text-slate-900">{entry.description}</td>
                  <td className="py-3">
                    <span className="capitalize font-sans px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                      {entry.type}
                    </span>
                  </td>
                  <td
                    className={`py-3 text-right font-bold ${
                      entry.amount > 0 ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {entry.amount > 0 ? `+${formatCurrency(entry.amount)}` : formatCurrency(entry.amount)}
                  </td>
                  <td className="py-3 text-right font-sans">
                    <span className="text-slate-600 capitalize text-[11px]">{entry.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Payout Modal */}
      <Modal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title="Request Linked Account Payout"
        subtitle="Funds settle via Razorpay Route directly to HDFC Bank A/C •••• 9812"
      >
        <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Transfer Amount (₹)</label>
            <input
              type="number"
              required
              max="38200"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] space-y-1">
            <span className="font-bold text-slate-800">Linked Account Details:</span>
            <p className="text-slate-500">Beneficiary: Aura Studio & Crafts</p>
            <p className="text-slate-500">Bank: HDFC Bank Ltd • IFSC: HDFC0001234</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayoutModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-sm"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorEarnings;
