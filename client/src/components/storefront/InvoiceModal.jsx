import React from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../api/client';
import Icons from '../common/Icons';

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-2026-${order._id.replace(/[^0-9]/g, '').slice(-5) || '48921'}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GST Tax Invoice"
      subtitle={`Invoice #${invoiceNo}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs text-slate-700 font-sans print:p-0">
        {/* Actions bar */}
        <div className="flex justify-end gap-2 pb-3 border-b border-slate-100 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            <Icons.Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-slate-900 font-serif">GalliKart</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-medium">Marketplace</span>
            </div>
            <p className="text-[11px] text-slate-500">GalliKart Technologies Pvt Ltd</p>
            <p className="text-[11px] text-slate-500">GSTIN: 29AAACG1234F1Z8 • HSN: 998319</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 uppercase">Tax Invoice</span>
            <p className="font-mono text-slate-900 font-medium mt-0.5">{invoiceNo}</p>
            <p className="text-[11px] text-slate-500">Date: {invoiceDate}</p>
            <p className="text-[11px] text-slate-500">Order: {order._id}</p>
          </div>
        </div>

        {/* Seller & Customer Details */}
        <div className="grid grid-cols-2 gap-6 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sold By (Artisan Vendor):</span>
            <p className="font-semibold text-slate-900 mt-1">{order.shop?.name || 'Aura Studio & Crafts'}</p>
            <p className="text-[11px] text-slate-500">City: {order.shop?.city || 'Jaipur'}, Rajasthan</p>
            <p className="text-[11px] text-slate-500">GSTIN: 08AAACX8812D1Z4</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billed & Shipped To:</span>
            <p className="font-semibold text-slate-900 mt-1">{order.shippingAddress?.fullName || order.customerName}</p>
            <p className="text-[11px] text-slate-500">{order.shippingAddress?.street}</p>
            <p className="text-[11px] text-slate-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p className="text-[11px] text-slate-500">Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">HSN</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">GST (5%)</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {order.items?.map((item, i) => {
                const itemTotal = item.price * item.quantity;
                const taxPart = Math.round(itemTotal * 0.05);
                return (
                  <tr key={i} className="text-xs">
                    <td className="py-3 font-sans">
                      <p className="font-medium text-slate-900">{item.name || item.product?.name}</p>
                      <p className="text-[10px] text-slate-400 font-sans">{item.selectedSize} • {item.selectedColor}</p>
                    </td>
                    <td className="py-3 text-center text-slate-500 text-[11px]">5007</td>
                    <td className="py-3 text-center text-slate-900">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-700">{formatCurrency(item.price)}</td>
                    <td className="py-3 text-right text-slate-500">{formatCurrency(taxPart)}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Subtotal</span>
              <span>{formatCurrency(order.pricing?.subtotal || 2999)}</span>
            </div>
            {order.pricing?.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="font-sans">Discount</span>
                <span>- {formatCurrency(order.pricing?.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Shipping Charge</span>
              <span>{order.pricing?.shipping === 0 ? 'FREE' : formatCurrency(order.pricing?.shipping || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">CGST (2.5%) + SGST (2.5%)</span>
              <span>{formatCurrency(order.pricing?.tax || 149)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span className="font-sans">Total Paid</span>
              <span className="text-indigo-600">{formatCurrency(order.pricing?.total || 3148)}</span>
            </div>
          </div>
        </div>

        {/* Footer declaration */}
        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1 text-center">
          <p>Payment Mode: {order.paymentMethod || 'Razorpay Online Escrow'} • Status: {order.paymentStatus || 'Captured'}</p>
          <p>This is a computer-generated tax invoice and requires no physical signature.</p>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
