import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toggleWishlist } from '../../services/userService';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { user, wishlistIds, toggleWishlistId } = useAuth();
  const [wishlisted, setWishlisted] = useState(() => wishlistIds.includes(product._id));
  const [hoverImg, setHoverImg] = useState(false);

  const price    = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to wishlist items'); return; }
    try {
      await toggleWishlist(product._id);
      const next = !wishlisted;
      setWishlisted(next);
      toggleWishlistId(product._id);
      toast.success(next ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  return (
    <Link to={`/product/${product._id}`} className="group block w-full bg-transparent">
      
      {/* ── IMAGE ── */}
      <div 
        className="relative w-full aspect-[4/5] rounded-sm overflow-hidden bg-[var(--color-border-light)] mb-4"
        onMouseEnter={() => setHoverImg(true)}
        onMouseLeave={() => setHoverImg(false)}
      >
        <img
          src={(hoverImg && product.images[1]?.url) ? product.images[1].url : product.images[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[var(--color-cta)] text-white font-body text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
            {discount}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-[var(--color-background)]/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] bg-white/90 px-4 py-2 rounded-sm shadow-sm">Out of Stock</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          title="Wishlist"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline shadow-sm
            ${wishlisted ? 'bg-[var(--color-cta)] text-white opacity-100' : 'bg-white text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-cta)] hover:scale-110'}`}
        >
          <FiHeart size={14} className={wishlisted ? 'fill-current' : ''} />
        </button>
      </div>

      {/* ── DETAILS ── */}
      <div className="flex flex-col text-left">
        
        {/* Brand / Category (Small, Muted) */}
        <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
          {product.brand || product.category}
        </span>

        {/* Title (Medium, Serif) */}
        <h3 className="font-heading text-xl font-bold text-[var(--color-primary)] leading-tight mb-2 group-hover:text-[var(--color-accent-dark)] transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Reviews */}
        {(product.numReviews > 0) && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar size={10} className="text-[var(--color-accent)] fill-current" />
            <span className="font-body text-[11px] font-medium text-[var(--color-text-muted)]">{product.ratings?.toFixed(1)}</span>
          </div>
        )}

        {/* Price (Bold, Sans-serif) */}
        <div className="flex items-center gap-3">
          <span className="font-body text-[15px] font-bold text-[var(--color-text)]">₹{price.toLocaleString()}</span>
          {discount > 0 && <span className="font-body text-[13px] font-medium text-[var(--color-text-light)] line-through">₹{product.price.toLocaleString()}</span>}
        </div>

      </div>
    </Link>
  );
}
