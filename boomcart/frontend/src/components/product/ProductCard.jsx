import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toggleWishlist } from '../../services/userService';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0] || '');
  };

  return (
    <Link to={`/product/${product._id}`} className="group" style={{ display: 'block', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5D9C5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.3s ease' }}>
      {/* Image */}
      <div
        style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#FDF7F0' }}
        onMouseEnter={() => setHoverImg(true)}
        onMouseLeave={() => setHoverImg(false)}
      >
        <img
          src={(hoverImg && product.images[1]?.url) ? product.images[1].url : product.images[0]?.url}
          alt={product.name}
          className="group-hover:scale-105"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          loading="lazy"
        />
        {/* Discount badge */}
        {discount > 0 && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#C25A3C', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
            {discount}% OFF
          </span>
        )}
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>Out of Stock</span>
          </div>
        )}
        {/* Wishlist button */}
        <div className="opacity-0 group-hover:opacity-100" style={{ position: 'absolute', top: '10px', right: '10px', transition: 'opacity 0.3s ease' }}>
          <button
            style={{
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s ease',
              backgroundColor: wishlisted ? '#fde8e4' : '#fff',
              color: wishlisted ? '#B85C4B' : '#2C3E2F',
            }}
            onClick={handleWishlist}
            title="Wishlist"
          >
            <FiHeart size={14} />
          </button>
        </div>
      </div>

      {/* Info — box model: each element has explicit margin, no flex gap */}
      <div style={{ padding: '16px 16px 20px 16px' }}>
        {/* Category label */}
        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9eaa9f', fontWeight: 600, marginBottom: '8px' }}>
          {product.category} · {product.subCategory}
        </p>

        {/* Product name */}
        <h3 className="font-heading line-clamp-2 group-hover:text-[#C25A3C]" style={{ fontSize: '17px', fontWeight: 700, color: '#1E3A3A', lineHeight: 1.35, marginBottom: '8px', transition: 'color 0.3s ease' }}>
          {product.name}
        </h3>

        {/* Star ratings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {[1,2,3,4,5].map(star => (
              <FiStar
                key={star}
                size={12}
                style={{ color: star <= Math.round(product.ratings || 0) ? '#D4AF37' : '#E5D9C5' }}
                fill={star <= Math.round(product.ratings || 0) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          {product.numReviews > 0 && (
            <span style={{ fontSize: '11px', color: '#9eaa9f', fontWeight: 500 }}>({product.numReviews})</span>
          )}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#C25A3C' }}>₹{price.toLocaleString()}</span>
          {discount > 0 && <span style={{ fontSize: '14px', fontWeight: 500, color: '#9eaa9f', textDecoration: 'line-through' }}>₹{product.price.toLocaleString()}</span>}
        </div>

        {/* Add to Cart button */}
        <button
          style={{
            width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            backgroundColor: '#C25A3C', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            borderRadius: '999px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(194,90,60,0.2)', transition: 'all 0.3s ease',
            opacity: product.stock === 0 ? 0.4 : 1,
          }}
          className="hover:bg-[#1E3A3A] hover:shadow-md"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <FiShoppingCart size={14} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
