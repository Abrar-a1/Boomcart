import React, { useState, useEffect } from 'react';
import { FiStar, FiCheckCircle } from 'react-icons/fi';
import { getProductReviews, createReview } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReviewsSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await getProductReviews(productId);
      setReviews(data.data);
      setStats({
        total: data.totalReviews,
        average: data.data.length ? (data.data.reduce((acc, r) => acc + r.rating, 0) / data.data.length).toFixed(1) : 0
      });
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.comment) {
      toast.error('Please provide a title and comment.');
      return;
    }
    
    setSubmitting(true);
    try {
      await createReview({ productId, ...form });
      toast.success('Review submitted successfully!');
      setShowForm(false);
      setForm({ rating: 5, title: '', comment: '' });
      fetchReviews(); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, size = 16 }) => {
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={size}
            className={star <= rating ? 'fill-current text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-16 pt-10 border-t border-[var(--color-border-light)] w-full max-w-4xl mx-auto">
      <h2 className="font-heading text-3xl text-[var(--color-primary)] mb-8 font-bold">Customer Reviews</h2>
      
      {/* Summary */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-[var(--color-background)] border border-[var(--color-border-light)] p-8 rounded-sm">
        <div className="text-center md:text-left flex-shrink-0">
          <p className="font-heading text-6xl font-bold text-[var(--color-primary)]">{stats.average}</p>
          <div className="flex justify-center md:justify-start mt-3 mb-2">
            <StarRating rating={Math.round(stats.average)} size={20} />
          </div>
          <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Based on {stats.total} reviews</p>
        </div>
        
        <div className="flex-1 text-center md:text-right">
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[var(--color-primary)] hover:bg-black text-[var(--color-background)] font-body text-xs font-bold uppercase tracking-widest py-4 px-8 rounded-sm transition-colors focus-visible:outline"
            >
              {showForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          ) : (
            <p className="font-body text-sm text-[var(--color-text-muted)] p-4 rounded-sm border border-[var(--color-border-light)] inline-block">
              Please <a href="/login" className="text-[var(--color-primary)] font-bold hover:underline focus-visible:outline">log in</a> to write a review.
            </p>
          )}
        </div>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] p-8 rounded-sm shadow-sm mb-12 animate-slide-down">
          <h3 className="font-heading text-2xl font-bold mb-6 text-[var(--color-primary)]">Share your thoughts</h3>
          
          <div className="mb-6">
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className="focus-visible:outline transition-transform hover:scale-110"
                >
                  <FiStar size={28} className={star <= form.rating ? 'fill-current text-[var(--color-accent)]' : 'text-[var(--color-border)]'} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Review Title</label>
            <input
              type="text"
              className="w-full border border-[var(--color-border-light)] bg-white p-4 font-body text-sm rounded-sm focus:border-[var(--color-primary)] outline-none transition-colors"
              placeholder="Summarize your experience..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Review Detail</label>
            <textarea
              className="w-full border border-[var(--color-border-light)] bg-white p-4 font-body text-sm rounded-sm focus:border-[var(--color-primary)] outline-none min-h-[120px] transition-colors resize-y"
              placeholder="What did you like or dislike about this product?"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
            ></textarea>
          </div>
          
          <button type="submit" disabled={submitting} className="bg-[var(--color-primary)] hover:bg-black text-[var(--color-background)] font-body text-xs font-bold uppercase tracking-widest py-4 px-10 rounded-sm transition-colors focus-visible:outline disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 font-body text-sm text-[var(--color-text-muted)] animate-pulse">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-sm">
          <p className="font-body text-sm text-[var(--color-text-muted)]">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-[var(--color-border-light)] pb-8 last:border-0 animate-smooth-reveal">
              <div className="flex justify-between items-start mb-3">
                <StarRating rating={review.rating} />
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <h4 className="font-heading text-xl font-bold text-[var(--color-primary)] mb-2">{review.title}</h4>
              <p className="font-body text-sm text-[var(--color-text)] mb-6 leading-relaxed opacity-90">{review.comment}</p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[var(--color-border-light)] text-[var(--color-primary)] flex items-center justify-center font-heading text-lg font-bold">
                  {review.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">{review.user?.name}</p>
                  {review.isVerifiedPurchase && (
                    <p className="font-body text-[10px] text-[var(--color-success)] font-bold flex items-center gap-1 mt-1 uppercase tracking-widest">
                      <FiCheckCircle size={10} /> Verified Purchase
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
