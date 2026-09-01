import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiCheck, FiTruck, FiRefreshCw, FiStar } from 'react-icons/fi';
import { getProductById } from '../services/productService';
import { getProductReviews, createReview } from '../services/reviewService';
import { toggleWishlist } from '../services/userService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import './ProductDetail.css';

function Stars({ rating, size = 16 }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= rating ? 'var(--gold)' : 'var(--gray-200)' }}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, wishlistIds, toggleWishlistId } = useAuth();

  const [product, setProduct]               = useState(null);
  const [reviews, setReviews]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeImg, setActiveImg]           = useState(0);
  const [selectedSize, setSelectedSize]     = useState('');
  const [selectedColor, setSelectedColor]   = useState('');
  const [qty, setQty]                       = useState(1);
  const [wishlisted, setWishlisted]         = useState(false);
  const [activeTab, setActiveTab]           = useState('details');
  const [reviewForm, setReviewForm]         = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting]         = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProductById(id), getProductReviews(id)])
      .then(([pRes, rRes]) => {
        const p = pRes.data.data;
        setProduct(p);
        setReviews(rRes.data.data);
        if (p.sizes?.[0])  setSelectedSize(p.sizes[0]);
        if (p.colors?.[0]) setSelectedColor(p.colors[0]);
        // Fix #3: init wishlisted from real wishlist state
        setWishlisted(wishlistIds.includes(p._id));
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <div className="page container"><p>Product not found.</p></div>;

  const price    = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    addToCart(product, qty, selectedSize, selectedColor);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Login to wishlist items'); return; }
    try {
      await toggleWishlist(product._id);
      const next = !wishlisted;
      setWishlisted(next);
      toggleWishlistId(product._id);
      toast.success(next ? 'Added to wishlist!' : 'Removed from wishlist');
    }
    catch { toast.error('Failed'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to review'); return; }
    if (!reviewForm.title || !reviewForm.comment) { toast.error('Fill all fields'); return; }
    setSubmitting(true);
    try {
      const { data } = await createReview({ ...reviewForm, productId: id });
      setReviews([data.data, ...reviews]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>{product.name} — Boomcart</title></Helmet>
      <div className="page">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> /
            <Link to={`/?category=${product.category}`}>{product.category}</Link> /
            <span>{product.name}</span>
          </div>

          <div className="pd-grid">
            {/* Images */}
            <div className="pd-images">
              <div className="pd-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`pd-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt={`View ${i+1}`} />
                  </button>
                ))}
              </div>
              <div className="pd-main-img">
                <img src={product.images[activeImg]?.url} alt={product.name} />
                {discount > 0 && <span className="pd-discount-badge">{discount}% OFF</span>}
              </div>
            </div>

            {/* Product Video (if uploaded) */}
            {product.video?.url && (
              <div style={{ gridColumn:'1/-1', marginTop:8, marginBottom:-20 }}>
                <video
                  src={product.video.url}
                  controls
                  style={{ width:'100%', maxHeight:420, borderRadius:'var(--radius-lg)', background:'#000', display:'block' }}
                  poster={product.images[0]?.url}
                />
              </div>
            )}

            {/* Info */}
            <div className="pd-info">
              <span className="badge badge-navy">{product.category} · {product.subCategory}</span>
              <h1 className="pd-name">{product.name}</h1>

              <div className="pd-rating-row">
                <Stars rating={Math.round(product.ratings)} />
                <span className="pd-rating-text">{product.ratings} ({product.numReviews} reviews)</span>
              </div>

              <div className="pd-price-row">
                <span className="pd-price">₹{price.toLocaleString()}</span>
                {discount > 0 && <>
                  <span className="pd-orig-price">₹{product.price.toLocaleString()}</span>
                  <span className="badge badge-red" style={{ fontSize: 12 }}>Save {discount}%</span>
                </>}
              </div>

              <div className="pd-delivery">
                <FiTruck size={15} />
                <span>{price > 999 ? 'Free delivery' : 'Delivery ₹99'} · Ships in 3–5 days</span>
              </div>

              {product.colors?.length > 0 && (
                <div className="pd-selector">
                  <p className="pd-selector-label">Colour: <strong>{selectedColor}</strong></p>
                  <div className="pd-colors">
                    {product.colors.map(c => (
                      <button key={c} className={`color-dot ${selectedColor === c ? 'active' : ''}`}
                        style={{ background: c }} title={c} onClick={() => setSelectedColor(c)} />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div className="pd-selector">
                  <p className="pd-selector-label">Size: <strong>{selectedSize}</strong></p>
                  <div className="pd-sizes">
                    {product.sizes.map(s => (
                      <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pd-qty-row">
                <span className="pd-selector-label">Qty:</span>
                <div className="qty-control">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
                <span className={`stock-label ${product.stock > 0 ? 'in' : 'out'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="pd-ctas">
                <button className="btn btn-primary pd-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                  <FiShoppingCart /> Add to Cart
                </button>
                <button className={`btn btn-outline pd-btn ${wishlisted ? 'pd-btn--wishlisted' : ''}`} onClick={handleWishlist}>
                  <FiHeart /> {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>

              <div className="pd-trust">
                <div className="trust-item"><FiCheck size={14} /> 100% Genuine</div>
                <div className="trust-item"><FiTruck size={14} /> Easy Returns</div>
                <div className="trust-item"><FiRefreshCw size={14} /> 7-Day Exchange</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="pd-tabs card" style={{ padding: 0, marginTop: 36 }}>
            <div className="tabs-nav">
              {['details','reviews'].map(t => (
                <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t === 'details' ? 'Product Details' : `Reviews (${reviews.length})`}
                </button>
              ))}
            </div>

            <div className="tab-body" style={{ padding: '24px 28px' }}>
              {activeTab === 'details' && (
                <div className="pd-details-tab">
                  <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 15 }}>{product.description}</p>
                  {product.tags?.length > 0 && (
                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {product.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {user && (
                    <form className="review-form" onSubmit={handleReview}>
                      <h4 style={{ marginBottom: 14, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>Write a Review</h4>
                      <div className="star-picker">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button"
                            style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: s <= reviewForm.rating ? 'var(--gold)' : 'var(--gray-200)', transition: 'color .15s' }}
                            onClick={() => setReviewForm({...reviewForm, rating: s})}>★</button>
                        ))}
                      </div>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <input className="form-input" placeholder="Review title" value={reviewForm.title}
                          onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
                      </div>
                      <div className="form-group" style={{ marginTop: 10 }}>
                        <textarea className="form-input" rows={3} placeholder="Share your experience..." value={reviewForm.comment}
                          onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
                      </div>
                      <button className="btn btn-primary btn-sm" type="submit" disabled={submitting} style={{ marginTop: 10 }}>
                        {submitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  )}

                  {reviews.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', padding: '20px 0' }}>No reviews yet. Be the first!</p>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map(r => (
                        <div key={r._id} className="review-card">
                          <div className="review-header">
                            <div>
                              <p className="review-author">{r.user?.name}</p>
                              <Stars rating={r.rating} size={13} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                              {r.isVerifiedPurchase && <span className="badge badge-green" style={{ fontSize: 10, marginTop: 4 }}>Verified</span>}
                            </div>
                          </div>
                          <p style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 14, marginBottom: 4 }}>{r.title}</p>
                          <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
