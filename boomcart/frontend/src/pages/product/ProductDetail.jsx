import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiHeart, FiMinus, FiPlus, FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';
import KidsLayout from '../../layouts/KidsLayout';
import BridalLayout from '../../layouts/BridalLayout';
import productService from '../../services/productService';
import { toggleWishlist } from '../../services/userService';
import BookingModal from '../../components/booking/BookingModal';
import ReviewsSection from '../../components/product/ReviewsSection';
import ProductCard from '../../components/product/ProductCard';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Wishlist state
  const { user, wishlistIds, toggleWishlistId } = useAuth();
  const isWishlisted = product ? wishlistIds.includes(product._id) : false;

  // Mobile Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const addToCart = useStore(state => state.addToCart);
  const cart = useStore(state => state.cart);

  useEffect(() => {
    productService.getProductById(id)
      .then(res => {
        const prod = res.data.data || res.data.product;
        setProduct(prod);
        
        // Fetch related products (same category)
        productService.getProducts({ category: prod.category, limit: 5 })
          .then(relRes => {
            const relData = relRes.data.data || relRes.data.products || [];
            setRelatedProducts(relData.filter(p => p._id !== prod._id).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm text-[var(--color-text-muted)] animate-pulse">Loading piece...</div>;
  if (!product) return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm font-bold text-[var(--color-error)]">Product Not Found</div>;

  const isBridal = product.category === 'bridal';
  const isKids   = ['kids', 'boys', 'girls'].includes(product.category);

  // Check how many of this item/size are already in cart
  const cartItem = cart.find(item => item.product._id === product._id && item.size === selectedSize);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  
  const sizeObj = product.sizes?.find(s => s.size === selectedSize);
  const availableStock = selectedSize ? (sizeObj ? sizeObj.stock : 0) : product.stock;
  const maxAllowed = Math.min(availableStock - qtyInCart, 10);
  
  const isOutOfStock = product.stock === 0 || (selectedSize && sizeObj?.stock === 0);
  const isMaxReached = maxAllowed <= 0 && selectedSize;

  const handleQuantity = (type) => {
    if (type === 'inc' && quantity < maxAllowed) setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = () => {
    if (!product.sizes?.length) {
      if (product.stock === 0) return toast.error('Out of stock');
      addToCart(product, null, quantity);
      toast.success('Added to bag');
      setQuantity(1);
      return;
    }
    
    if (!selectedSize) return toast.error('Please select a size');
    if (isOutOfStock) return toast.error('Selected size is out of stock');
    if (isMaxReached) return toast.error('Maximum available quantity reached in cart');

    addToCart(product, selectedSize, quantity);
    toast.success('Added to bag');
    setQuantity(1);
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Login to wishlist items');
    try {
      await toggleWishlist(product._id);
      toggleWishlistId(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [{ url: '/images/placeholder.png' }];
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  const content = (
    <div className="relative animate-smooth-reveal pb-24 lg:pb-0">
      <Helmet><title>{product.name} — Boomcart</title></Helmet>
      
      {showBooking && <BookingModal productId={product._id} onClose={() => setShowBooking(false)} />}

      {/* ── DESKTOP SPLIT LAYOUT ── */}
      <div className="max-w-[1440px] mx-auto lg:px-12 flex flex-col lg:flex-row gap-0 lg:gap-12 xl:gap-20">
        
        {/* ── 60% LEFT: EDITORIAL GALLERY (2-COLUMN GRID) ── */}
        <div className="w-full lg:w-[58%] xl:w-[60%] flex flex-col">
          
          {/* Desktop Gallery */}
          <div className="hidden lg:grid grid-cols-2 gap-4 pb-20 pt-8">
            {images.map((img, idx) => (
              <div key={idx} className={`bg-[var(--color-border-light)] overflow-hidden rounded-sm ${images.length === 1 || (images.length === 3 && idx === 0) ? 'col-span-2 aspect-[4/5]' : 'aspect-[3/4]'}`}>
                <img 
                  src={img.url} 
                  alt={`${product.name} view ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 cursor-crosshair"
                />
              </div>
            ))}
          </div>

          {/* Mobile Gallery (Swipeable) */}
          <div className="lg:hidden relative w-full h-[75vh] min-h-[500px] bg-[var(--color-border-light)]">
            <div 
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.clientWidth;
                setActiveImageIndex(Math.round(scrollLeft / width));
              }}
            >
              {images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img.url} 
                  alt={`${product.name} view ${idx + 1}`} 
                  className="w-full h-full flex-shrink-0 snap-center object-cover"
                />
              ))}
            </div>
            {/* Gallery Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 transition-all duration-300 rounded-sm ${activeImageIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 40% RIGHT: INFO (STICKY) ── */}
        <div className="w-full lg:w-[42%] xl:w-[40%] px-6 py-10 lg:px-0 lg:py-16">
          <div className="lg:sticky lg:top-32 flex flex-col">
            
            {/* Breadcrumbs / Category */}
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 block">
              {product.brand || product.category} {product.subCategory ? ` / ${product.subCategory}` : ''}
            </span>

            {/* Title */}
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-[var(--color-primary)] leading-[1.1] mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              {isBridal && product.priceRange ? (
                <span className="font-body text-lg font-bold text-[var(--color-text)]">{product.priceRange}</span>
              ) : (
                <>
                  <span className="font-body text-xl font-bold text-[var(--color-text)]">₹{price.toLocaleString()}</span>
                  {product.discountPrice > 0 && (
                    <span className="font-body text-sm font-semibold text-[var(--color-text-light)] line-through">₹{product.price.toLocaleString()}</span>
                  )}
                </>
              )}
            </div>

            <div className="w-full h-[1px] bg-[var(--color-border-main)] mb-8" />

            {/* Sizing */}
            {!isBridal && product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Size</span>
                  <button className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] underline transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => {
                    const isSelected = selectedSize === s.size;
                    const isOut = s.stock === 0;
                    return (
                      <button 
                        key={s.size} 
                        disabled={isOut} 
                        onClick={() => { setSelectedSize(s.size); setQuantity(1); }}
                        className={`min-w-[3.5rem] h-10 px-4 font-body text-xs font-semibold rounded-sm transition-all focus-visible:outline ${
                          isOut
                            ? 'bg-[var(--color-background)] text-[var(--color-border)] border border-[var(--color-border-light)] line-through cursor-not-allowed' 
                            : isSelected
                              ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary)]' 
                              : 'bg-transparent border border-[var(--color-border-main)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions: Quantity & Add to Bag */}
            <div className="hidden lg:flex flex-col gap-4 mb-10">
              {isBridal ? (
                <button 
                  onClick={() => setShowBooking(true)} 
                  className="w-full h-14 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-[0.15em] rounded-sm transition-colors hover:bg-black focus-visible:outline"
                >
                  Reserve Consultation
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center justify-between border border-[var(--color-border-main)] rounded-sm h-14 w-32 px-2">
                    <button 
                      aria-label="Decrease quantity"
                      onClick={() => handleQuantity('dec')} 
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-[var(--color-text)] disabled:opacity-30 transition-opacity focus-visible:outline"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="font-body text-sm font-semibold">{quantity}</span>
                    <button 
                      aria-label="Increase quantity"
                      onClick={() => handleQuantity('inc')} 
                      disabled={quantity >= maxAllowed || !selectedSize}
                      className="w-10 h-10 flex items-center justify-center text-[var(--color-text)] disabled:opacity-30 transition-opacity focus-visible:outline"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                  
                  {/* Add to Bag */}
                  <button 
                    onClick={handleAddToCart}
                    disabled={(!selectedSize && product.sizes?.length > 0) || isOutOfStock} 
                    className="flex-1 h-14 bg-[var(--color-cta)] text-white font-body text-xs font-bold uppercase tracking-[0.15em] rounded-sm transition-all hover:bg-[var(--color-cta-dark)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
                  >
                    {isOutOfStock ? 'Out of Stock' : (!selectedSize && product.sizes?.length > 0) ? 'Select Size' : 'Add to Bag'}
                  </button>
                  
                  {/* Wishlist */}
                  <button
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={handleWishlist}
                    className={`h-14 w-14 flex items-center justify-center border rounded-sm transition-colors focus-visible:outline ${isWishlisted ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border-main)] text-[var(--color-primary)] hover:border-[var(--color-primary)]'}`}
                  >
                    <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
                  </button>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div className="flex flex-col border-t border-[var(--color-border-main)]">
              
              {/* Description */}
              <div className="border-b border-[var(--color-border-main)]">
                <button 
                  aria-expanded={activeAccordion === 'details'}
                  aria-controls="details-care-content"
                  onClick={() => setActiveAccordion(activeAccordion === 'details' ? '' : 'details')}
                  className="w-full flex items-center justify-between py-5 font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)] group focus-visible:outline"
                >
                  Details & Care
                  <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors">
                    {activeAccordion === 'details' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </span>
                </button>
                <div id="details-care-content" role="region" className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === 'details' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                  <p className="font-body text-sm text-[var(--color-text)] leading-relaxed opacity-90">
                    {product.description}
                  </p>
                  <ul className="mt-4 space-y-2 font-body text-xs text-[var(--color-text-muted)]">
                    <li className="flex items-center gap-2">✓ Handcrafted detailing</li>
                    <li className="flex items-center gap-2">✓ Premium materials</li>
                    <li className="flex items-center gap-2">✓ Dry clean only</li>
                  </ul>
                </div>
              </div>

              {/* Delivery */}
              <div className="border-b border-[var(--color-border-main)]">
                <button 
                  aria-expanded={activeAccordion === 'delivery'}
                  aria-controls="delivery-returns-content"
                  onClick={() => setActiveAccordion(activeAccordion === 'delivery' ? '' : 'delivery')}
                  className="w-full flex items-center justify-between py-5 font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)] group focus-visible:outline"
                >
                  Delivery & Returns
                  <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-colors">
                    {activeAccordion === 'delivery' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </span>
                </button>
                <div id="delivery-returns-content" role="region" className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === 'delivery' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <FiCheckCircle size={16} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <p className="font-body text-xs text-[var(--color-text)] leading-relaxed"><strong className="font-semibold text-[var(--color-primary)]">Free Global Shipping</strong><br/>Enjoy complimentary express delivery on all orders above ₹10,000.</p>
                    </div>
                    <div className="flex gap-3">
                      <FiCheckCircle size={16} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <p className="font-body text-xs text-[var(--color-text)] leading-relaxed"><strong className="font-semibold text-[var(--color-primary)]">14-Day Returns</strong><br/>Try it on at home. Return within 14 days for a full refund (excluding bespoke items).</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--color-border-main)] p-4 pb-[env(safe-area-inset-bottom,16px)] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          {isBridal ? (
            <button 
              onClick={() => setShowBooking(true)} 
              className="flex-1 h-12 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm transition-colors focus-visible:outline"
            >
              Reserve Consultation
            </button>
          ) : (
            <button 
              onClick={handleAddToCart}
              disabled={(!selectedSize && product.sizes?.length > 0) || isOutOfStock} 
              className="flex-1 h-12 bg-[var(--color-cta)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm transition-colors active:bg-[var(--color-cta-dark)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
            >
              {isOutOfStock ? 'Out of Stock' : (!selectedSize && product.sizes?.length > 0) ? 'Select Size' : `Add to Bag • ₹${price.toLocaleString()}`}
            </button>
          )}
          
          <button
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleWishlist}
            className={`w-12 h-12 flex items-center justify-center border rounded-sm shrink-0 transition-colors focus-visible:outline ${isWishlisted ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border-main)] text-[var(--color-primary)]'}`}
          >
            <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <div className="px-6 lg:px-12 py-16 lg:py-24 max-w-[1440px] mx-auto border-t border-[var(--color-border-light)] mt-12 lg:mt-24">
          <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-10">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── REVIEWS ── */}
      <div className="px-6 lg:px-12 py-20 bg-white">
        <ReviewsSection productId={product._id} />
      </div>
    </div>
  );

  // Wrap in appropriate layout if necessary
  if (isBridal) return <BridalLayout>{content}</BridalLayout>;
  if (isKids) return <KidsLayout>{content}</KidsLayout>;
  return content;
}
