import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import PageContainer from '../../components/common/PageContainer';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useStore();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-smooth-reveal w-full bg-[var(--color-background)] px-4">
        <Helmet><title>Your Bag | Boomcart</title></Helmet>
        <div className="text-[var(--color-primary)] opacity-20 mb-8">
          <FiTrash2 size={48} />
        </div>
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4">Your bag is empty.</h2>
        <p className="font-body text-sm text-[var(--color-text-muted)] mb-10 max-w-md">
          Discover our latest collections and add some timeless pieces to your wardrobe.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[var(--color-primary)] text-white font-body text-sm font-bold uppercase tracking-widest py-4 px-10 rounded-sm shadow-sm hover:opacity-90 transition-opacity min-h-[44px] focus-visible:outline"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] pt-12 pb-24">
      <Helmet><title>Your Bag ({totalItems}) | Boomcart</title></Helmet>
      <PageContainer variant="functional" className="animate-smooth-reveal">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* ── BAG ITEMS ── */}
          <div className="w-full lg:w-[65%] flex flex-col">
            <div className="flex justify-between items-end border-b border-[var(--color-border-light)] pb-6 mb-8">
              <div>
                <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] leading-none">Your Bag</h1>
                <span className="font-body text-sm text-[var(--color-text-muted)] mt-2 block">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>
              <button 
                onClick={clearCart} 
                className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-cta)] transition-colors focus-visible:outline"
              >
                Clear Bag
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}`} className="flex items-start gap-6 group">
                  
                  {/* Image */}
                  <div className="w-28 h-36 lg:w-32 lg:h-40 bg-[var(--color-border-light)] rounded-sm overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs font-body">No Img</div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col h-full py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-heading text-xl lg:text-2xl font-bold text-[var(--color-primary)] leading-tight mb-1">
                          {item.name}
                        </h3>
                        <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4 block">
                          Size: {item.selectedSize || 'N/A'}
                        </p>
                      </div>
                      <span className="font-body text-lg font-bold text-[var(--color-text)] shrink-0">
                        ₹{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-auto flex justify-between items-end">
                      {/* Quantity */}
                      <div className="flex items-center border border-[var(--color-border)] rounded-sm overflow-hidden">
                        <button 
                          onClick={() => decreaseQuantity(item.productId, item.selectedSize)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center bg-white text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 h-10 flex items-center justify-center bg-white font-body text-sm font-semibold text-[var(--color-text)] border-x border-[var(--color-border-light)]">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => increaseQuantity(item.productId, item.selectedSize)}
                          className="w-10 h-10 flex items-center justify-center bg-white text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors focus-visible:outline"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      
                      {/* Remove */}
                      <button 
                        onClick={() => removeFromCart(item.productId, item.selectedSize)}
                        className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-cta)] transition-colors flex items-center gap-1.5 focus-visible:outline"
                      >
                        <FiTrash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-28">
            <div className="bg-white border border-[var(--color-border)] rounded-sm p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-[var(--color-primary)] border-b border-[var(--color-border-light)] pb-4 mb-6">
                Order Summary
              </h2>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-body text-sm text-[var(--color-text-muted)]">Subtotal</span>
                <span className="font-body text-sm font-bold text-[var(--color-text)]">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-body text-sm text-[var(--color-text-muted)]">Delivery</span>
                <span className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-accent-dark)]">Complimentary</span>
              </div>
              
              <div className="border-t border-[var(--color-border-light)] pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-heading text-xl font-bold text-[var(--color-primary)]">Total</span>
                  <span className="font-body text-2xl font-bold text-[var(--color-cta)]">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 h-14 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-[0.15em] rounded-sm transition-all hover:opacity-90 shadow-[0_4px_14px_rgba(194,90,60,0.3)] hover:shadow-none focus-visible:outline"
              >
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="text-[var(--color-text-muted)]">🔒</span>
                <span className="font-body text-xs text-[var(--color-text-muted)]">Secure encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
