import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useStore();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in w-full">
        <Helmet><title>Your Cart is Empty | Boomcart</title></Helmet>
        <div className="text-8xl mb-6 opacity-30">🛒</div>
        <h2 className="text-3xl font-heading text-[#1E3A3A] mb-4">Your cart is feeling a bit light!</h2>
        <p className="text-[#6b7c6e] font-semibold mb-8 max-w-sm">
          Looks like you haven't added anything yet. Let's fix that!
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#C25A3C] text-white font-bold uppercase tracking-wider py-4 px-10 rounded-full shadow-md hover:bg-[#1E3A3A] hover:shadow-lg transition-all min-h-[44px]"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-6 page-transition">
      <Helmet><title>Checkout ({totalItems}) | Boomcart</title></Helmet>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Cart Item List Segment */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#E5D9C5] pb-4 mb-2">
            <h1 className="text-3xl font-heading text-[#1E3A3A] font-bold">Your Cart</h1>
            <button 
              onClick={clearCart} 
              className="text-[#C25A3C] hover:text-[#a4462e] font-bold uppercase tracking-wider text-xs transition-colors"
            >
              Empty Cart
            </button>
          </div>

          {cart.map((item) => (
            <div key={`${item.productId}-${item.selectedSize}`} className="flex items-center gap-4 bg-white border border-[#E5D9C5] p-4 rounded-2xl shadow-sm">
              <div className="w-24 h-24 bg-[#FDF7F0] rounded-xl overflow-hidden flex-shrink-0 border border-[#E5D9C5]">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9eaa9f] text-xs">Img</div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-[#1E3A3A] text-lg leading-tight">{item.name}</h3>
                <p className="text-sm font-semibold text-[#6b7c6e] mb-1.5 block">Size: {item.selectedSize || 'N/A'}</p>
                <p className="text-lg font-bold text-[#C25A3C]">₹{item.price.toLocaleString()}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center bg-[#FDF7F0] rounded-full border border-[#E5D9C5]">
                  <button 
                    onClick={() => decreaseQuantity(item.productId, item.selectedSize)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[#1E3A3A] hover:bg-[#E5D9C5] disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-[#1E3A3A] text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => increaseQuantity(item.productId, item.selectedSize)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[#1E3A3A] hover:bg-[#E5D9C5] transition"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.productId, item.selectedSize)}
                  className="text-[#C25A3C] hover:text-[#a4462e] p-2 transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Calculation Panel */}
        <div className="w-full lg:w-1/3 bg-white border border-[#E5D9C5] rounded-3xl p-6 sticky top-8 shadow-sm">
          <h2 className="text-xl font-heading text-[#1E3A3A] font-bold border-b border-[#E5D9C5] pb-4 mb-4">Order Summary</h2>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#6b7c6e] font-semibold">Items ({totalItems})</span>
            <span className="font-bold text-[#1E3A3A]">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-[#6b7c6e] font-semibold">Shipping</span>
            <span className="font-bold text-green-600">Free!</span>
          </div>
          
          <div className="border-t border-[#E5D9C5] pt-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-[#1E3A3A] font-bold text-lg">Total</span>
              <span className="text-3xl font-bold text-[#C25A3C]">₹{subtotal.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#C25A3C] hover:bg-[#1E3A3A] text-white font-bold uppercase tracking-wider text-sm py-4 rounded-full shadow-md hover:shadow-lg transition-colors duration-300 min-h-[44px]"
          >
            Secure Checkout
          </button>
        </div>

      </div>
    </div>
  );
}
