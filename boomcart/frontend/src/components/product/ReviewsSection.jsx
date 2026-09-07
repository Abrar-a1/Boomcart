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
    <div className="mt-16 pt-10 border-t border-gray-200 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-serif text-navy mb-8 font-bold">Customer Reviews</h2>
      
      {/* Summary */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-gray-50 p-6 rounded-2xl">
        <div className="text-center md:text-left flex-shrink-0">
          <p className="text-5xl font-black text-navy">{stats.average}</p>
          <div className="flex justify-center md:justify-start mt-2 mb-1">
            <StarRating rating={Math.round(stats.average)} size={20} />
          </div>
          <p className="text-sm text-gray-500">Based on {stats.total} reviews</p>
        </div>
        
        <div className="flex-1 text-center md:text-right">
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-navy hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition-all"
            >
              {showForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          ) : (
            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200 inline-block">
              Please <a href="/login" className="text-primary font-bold hover:underline">log in</a> to write a review.
            </p>
          )}
        </div>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-10">
          <h3 className="font-bold text-lg mb-4 text-navy">Share your thoughts</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <FiStar size={28} className={star <= form.rating ? 'fill-current text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Review Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="Summarize your experience..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Review Detail</label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
              placeholder="What did you like or dislike about this product?"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
            ></textarea>
          </div>
          
          <button type="submit" disabled={submitting} className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-gray-800 text-lg mb-2">{review.title}</h4>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">{review.comment}</p>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
                  {review.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{review.user?.name}</p>
                  {review.isVerifiedPurchase && (
                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
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
