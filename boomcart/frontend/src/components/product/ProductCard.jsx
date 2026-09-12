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
    <Link to={`/product/${product._id}`} className="group block w-full bg-transparent outline-none">
      
      {/* ── IMAGE ── */}
      <div 
        className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-sm overflow-hidden bg-[var(--color-border-light)] border border-[var(--color-border-light)] shadow-sm mb-4 lg:mb-6"
        onMouseEnter={() => setHoverImg(true)}
        onMouseLeave={() => setHoverImg(false)}
      >
        <img
          src={(hoverImg && product.images[1]?.url) ? product.images[1].url : product.images[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        
        {/* Minimal Badge */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 font-body text-[10px] font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-sm">
            {discount}% Off
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)] bg-white/90 px-4 py-2 rounded-sm shadow-sm">Out of Stock</span>
          </div>
        )}

        {/* Minimal Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline
            ${wishlisted ? 'bg-white/80 backdrop-blur-sm text-[var(--color-cta)] opacity-100 shadow-sm' : 'bg-transparent text-white opacity-0 group-hover:opacity-100 hover:scale-110 drop-shadow-md'}`}
        >
          <FiHeart size={14} className={wishlisted ? 'fill-current' : ''} />
        </button>
      </div>

      {/* ── DETAILS ── */}
      <div className="flex flex-col text-left">
        
        <div className="flex items-start justify-between gap-4 mb-2">
          {/* Brand / Category */}
          <span className="font-body text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {product.brand || product.category}
          </span>
          
          {/* Reviews */}
          {(product.numReviews > 0) && (
            <div className="flex items-center gap-1 shrink-0">
              <FiStar size={10} className="text-[var(--color-accent)] fill-current" />
              <span className="font-body text-[10px] font-bold text-[var(--color-text-muted)]">{product.ratings?.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading text-base md:text-xl lg:text-2xl font-bold text-[var(--color-primary)] leading-tight mb-1.5 md:mb-2 group-hover:text-[var(--color-text-muted)] transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="font-body text-sm md:text-base font-bold text-[var(--color-text)]">₹{price.toLocaleString()}</span>
          {discount > 0 && <span className="font-body text-xs font-semibold text-[var(--color-text-light)] line-through">₹{product.price.toLocaleString()}</span>}
        </div>

      </div>
    </Link>
  );
}
