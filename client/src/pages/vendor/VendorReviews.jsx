import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Icons from '../../components/common/Icons';

export const VendorReviews = () => {
  const { success, error: toastError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      setLoading(true);
      try {
        const prodRes = await api.products.getMyProducts();
        if (prodRes.success && Array.isArray(prodRes.data)) {
          const productList = prodRes.data;
          const allRev = [];
          for (const p of productList.slice(0, 5)) {
            const rRes = await api.reviews.getByProduct(p._id);
            if (rRes.success && Array.isArray(rRes.data)) {
              allRev.push(...rRes.data);
            }
          }
          if (mounted) setReviews(allRev);
        }
      } catch (err) {
        console.error('Failed to load vendor reviews:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      mounted = false;
    };
  }, []);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      if (api.reviews.reply) {
        await api.reviews.reply(replyingReview._id, replyText);
      }
      setReviews(
        reviews.map((r) =>
          r._id === replyingReview._id
            ? { ...r, vendorReply: { body: replyText, at: new Date().toISOString() } }
            : r
        )
      );
      success('Reply published on storefront!');
      setReplyingReview(null);
      setReplyText('');
    } catch (err) {
      toastError(err.message || 'Error posting reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Studio Customer Feedback & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Respond to verified patrons and maintain artisanal trust
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{rev.userName || rev.user?.name || 'Customer'}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Verified Buyer ✓
                    </span>
                  )}
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Icons.Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">{rev.comment || rev.review}</p>

              {rev.vendorReply ? (
                <div className="p-3 bg-slate-50 rounded-xl border-l-2 border-indigo-500 text-[11px] text-slate-600 space-y-0.5">
                  <span className="font-semibold text-slate-900">Your Official Studio Reply:</span>
                  <p>{rev.vendorReply.body}</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingReview(rev);
                    setReplyText('');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Write Public Reply</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-500">
          No customer reviews submitted yet for your studio pieces.
        </div>
      )}

      {/* Reply Modal */}
      <Modal
        isOpen={Boolean(replyingReview)}
        onClose={() => setReplyingReview(null)}
        title="Reply to Review"
        subtitle={`Review by ${replyingReview?.userName || 'Buyer'}`}
      >
        <form onSubmit={handleReplySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Your Artisan Statement</label>
            <textarea
              rows="3"
              required
              placeholder="Thank the patron or clarify garment care and fabric nuances..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReplyingReview(null)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReply}
              className="px-5 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submittingReply ? 'Publishing...' : 'Publish Reply'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorReviews;
