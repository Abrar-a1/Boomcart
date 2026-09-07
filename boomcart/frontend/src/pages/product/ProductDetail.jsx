import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import KidsLayout from '../../layouts/KidsLayout';
import BridalLayout from '../../layouts/BridalLayout';
import productService from '../../services/productService';
import BookingModal from '../../components/booking/BookingModal';
import ReviewsSection from '../../components/product/ReviewsSection';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  
  // Mobile Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const addToCart = useStore(state => state.addToCart);

  useEffect(() => {
    productService.getProductById(id)
      .then(res => setProduct(res.data.data || res.data.product))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm text-[var(--color-text-muted)] animate-pulse">Loading piece...</div>;
  if (!product) return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm font-bold text-[var(--color-error)]">Product Not Found</div>;

  const isBridal = product.category === 'bridal';
  const isKids   = ['kids', 'boys', 'girls'].includes(product.category);

  const handleAddToCart = () => {
    if (!product.sizes?.length) {
      addToCart(product, null, 1);
      toast.success('Added to bag');
      return;
    }
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    if (!sizeObj || sizeObj.stock === 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    addToCart(product, selectedSize, 1);
    toast.success('Added to bag');
  };

  const images = product.images && product.images.length > 0 ? product.images : [{ url: '/images/placeholder.png' }];
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  const content = (
    <div className="max-w-[1440px] mx-auto animate-smooth-reveal">
      <Helmet><title>{product.name} — Boomcart</title></Helmet>
      
      {showBooking && <BookingModal productId={product._id} onClose={() => setShowBooking(false)} />}

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-16">
        
        {/* ── 60% LEFT: EDITORIAL GALLERY ── */}
        <div className="w-full lg:w-[60%] flex flex-col">
          
          {/* Desktop: Stacked full-width images */}
          <div className="hidden lg:flex flex-col gap-4">
            {images.map((img, idx) => (
              <img 
                key={idx} 
                src={img.url} 
                alt={`${product.name} view ${idx + 1}`} 
                className="w-full bg-[var(--color-border-light)] object-cover rounded-sm"
              />
            ))}
          </div>

          {/* Mobile: Swipeable Carousel */}
          <div className="lg:hidden relative w-full h-[70vh] bg-[var(--color-border-light)]">
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
            {/* Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === idx ? 'w-6 bg-[var(--color-primary)]' : 'w-1.5 bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 40% RIGHT: INFO (STICKY) ── */}
        <div className="w-full lg:w-[40%] px-6 py-10 lg:px-0 lg:py-12">
          <div className="lg:sticky lg:top-32 flex flex-col">
            
            {/* Breadcrumbs / Category */}
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 block">
              {product.category} {product.subCategory ? ` / ${product.subCategory}` : ''}
            </span>

            {/* Title */}
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] leading-[1.1] mb-6">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              {isBridal && product.priceRange ? (
                <span className="font-body text-xl font-bold text-[var(--color-text)]">{product.priceRange}</span>
              ) : (
                <>
                  <span className="font-body text-2xl font-bold text-[var(--color-text)]">₹{price.toLocaleString()}</span>
                  {product.discountPrice > 0 && (
                    <span className="font-body text-lg font-medium text-[var(--color-text-light)] line-through">₹{product.price.toLocaleString()}</span>
                  )}
                </>
              )}
            </div>

            <div className="w-12 h-[1px] bg-[var(--color-accent)] opacity-40 mb-8" />

            {/* Description */}
            <p className="font-body text-sm text-[var(--color-text)] opacity-90 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Sizing */}
            {!isBridal && product.sizes?.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Select Size</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(s => (
                    <button 
                      key={s.size} 
                      disabled={s.stock === 0} 
                      onClick={() => setSelectedSize(s.size)}
                      className={`min-w-[3rem] h-12 px-4 font-body text-sm font-semibold border rounded-sm transition-all focus-visible:outline ${
                        s.stock === 0 
                          ? 'bg-[var(--color-background)] text-[var(--color-border)] border-[var(--color-border-light)] line-through cursor-not-allowed' 
                          : selectedSize === s.size 
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                            : 'bg-white border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {isBridal ? (
              <button 
                onClick={() => setShowBooking(true)} 
                className="w-full h-14 bg-[var(--color-primary)] text-white font-body text-sm font-bold uppercase tracking-[0.15em] rounded-sm transition-all hover:bg-black focus-visible:outline"
              >
                Reserve Consultation
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={(!selectedSize && product.sizes?.length > 0) || product.stock === 0} 
                className="w-full h-14 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-[0.15em] rounded-sm shadow-[0_4px_14px_rgba(194,90,60,0.3)] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline"
              >
                {product.stock === 0 ? 'Out of Stock' : (selectedSize || !product.sizes?.length ? 'Add to Bag' : 'Select a size')}
              </button>
            )}

            {/* Trust Signals */}
            <div className="mt-10 flex flex-col gap-4 py-6 border-y border-[var(--color-border-light)]">
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-accent)]">✓</span>
                <span className="font-body text-xs text-[var(--color-text-muted)]">Free global delivery on all luxury pieces</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-accent)]">✓</span>
                <span className="font-body text-xs text-[var(--color-text-muted)]">Complimentary returns within 14 days</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-accent)]">✓</span>
                <span className="font-body text-xs text-[var(--color-text-muted)]">Secure encrypted checkout</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="px-6 lg:px-12 py-20">
        <ReviewsSection productId={product._id} />
      </div>
    </div>
  );

  // Wrap in appropriate layout if necessary
  if (isBridal) {
    return <BridalLayout>{content}</BridalLayout>;
  }
  
  if (isKids) {
    return <KidsLayout>{content}</KidsLayout>;
  }

  return content;
}
