import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import KidsLayout from '../../layouts/KidsLayout';
import BridalLayout from '../../layouts/BridalLayout';
import productService from '../../services/productService';
import BookingModal from '../../components/booking/BookingModal';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  
  // Zustand hook
  const addToCart = useStore(state => state.addToCart);

  useEffect(() => {
    productService.getProductById(id)
      .then(res => setProduct(res.data.data || res.data.product))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading amazing fashion...</div>;
  if (!product) return <div className="p-20 text-center font-bold text-red-500">Product Not Found</div>;

  const isBridal = product.category === 'bridal';

  const handleAddToCart = () => {
    if (!product.sizes?.length) {
      // Products with no sizing explicitly (like generic accessories)
      addToCart(product, null, 1);
      toast.success(`${product.name} added to cart!`);
      return;
    }
    
    if (!selectedSize) {
      toast.error('You must select a size first!');
      return;
    }

    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    if (!sizeObj || sizeObj.stock === 0) {
      toast.error('Sorry, this size is out of stock!');
      return;
    }

    addToCart(product, selectedSize, 1);
    toast.success(`Added Size ${selectedSize} to your cart! 🛍️`);
  };

  const isKids   = ['kids', 'boys', 'girls'].includes(product.category);

  // --- KIDS UX HANDLER ---
  if (isKids) {
    return (
      <KidsLayout>
        <Helmet><title>{product.name} | Kids Fashion — Boomcart</title></Helmet>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg border border-yellow-200">
             <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
             <h1 className="text-4xl font-black text-gray-800 mb-2">{product.name}</h1>
             <p className="text-3xl text-blue-600 font-bold mb-6">₹{product.price.toLocaleString()}</p>
             <p className="text-gray-600 mb-8">{product.description}</p>
             
             {product.sizes?.length > 0 && (
               <div className="mb-6">
                 <p className="text-sm font-bold text-gray-500 uppercase mb-2">Select Size</p>
                 <div className="flex gap-3">
                   {product.sizes.map(s => (
                     <button key={s.size} disabled={s.stock === 0} onClick={() => setSelectedSize(s.size)}
                       className={`w-12 h-12 rounded-full font-bold border-2 transition-all ${
                         s.stock === 0 ? 'bg-gray-100 text-gray-300 border-gray-100 line-through' :
                         selectedSize === s.size ? 'bg-yellow-400 text-navy border-yellow-400 shadow-md scale-110' : 'border-gray-200 text-gray-600 hover:border-yellow-400'
                       }`}>
                       {s.size}
                     </button>
                   ))}
                 </div>
               </div>
             )}
             
             <button 
               onClick={handleAddToCart}
               disabled={(!selectedSize && product.sizes?.length > 0) || product.stock === 0} 
               className="bg-blue-600 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_rgba(37,99,235,1)] hover:translate-y-1 hover:shadow-[0_0px_0_0_rgba(37,99,235,1)] transition-all disabled:opacity-50 min-h-[44px]">
               {product.stock === 0 ? 'Out of Stock' : (selectedSize || !product.sizes?.length ? 'Toss into Cart! 🛒' : 'Pick a size first!')}
             </button>
          </div>
        </div>
      </KidsLayout>
    );
  }

  // --- BRIDAL / COUTURE UX HANDLER ---
  if (isBridal) {
    return (
      <BridalLayout>
        <Helmet><title>{product.name} | Couture Boutique — Boomcart</title></Helmet>
        
        {showBooking && <BookingModal productId={product._id} onClose={() => setShowBooking(false)} />}
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="w-full aspect-[3/4] bg-[#fdfbf7] p-4 border border-[#f0ece6]">
            <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover shadow-sm" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#2c2825] mb-4">{product.name}</h1>
            <p className="font-sans text-lg text-[#8a8176] tracking-wider mb-8">{product.priceRange ? product.priceRange : `₹${product.price.toLocaleString()}`}</p>
            
            <div className="w-12 h-[1px] bg-[#d9cbb8] mb-8"></div>
            
            <p className="font-serif text-[#6b6660] leading-relaxed mb-12">
              {product.description}
            </p>
  
            <div className="space-y-4">
              <button onClick={() => setShowBooking(true)} 
                className="w-full bg-[#2c2825] text-[#fdfbf7] font-serif uppercase tracking-widest text-sm py-5 hover:bg-[#1a1816] transition-colors min-h-[44px]">
                Reserve Consultation
              </button>
            </div>
          </div>
        </div>
      </BridalLayout>
    );
  }

  // --- DEFAULT ADULT UX HANDLER (Men, Women, Unisex) ---
  return (
    <div className="flex flex-col md:flex-row gap-10 lg:gap-16 py-6 page-transition">
      <Helmet><title>{product.name} — Boomcart</title></Helmet>
      
      {/* Image */}
      <div className="w-full md:w-1/2 aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-[#E5D9C5] bg-white">
        <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-102" />
      </div>

      {/* Info */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <span className="text-xs tracking-[0.2em] uppercase mb-2 font-semibold text-[#D4AF37]">
          {product.category} · {product.subCategory}
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1E3A3A] mb-3">{product.name}</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-2xl sm:text-3xl font-bold text-[#C25A3C]">₹{product.price.toLocaleString()}</span>
          {product.discountPrice > 0 && (
            <span className="text-sm font-medium text-[#9eaa9f] line-through">₹{product.price.toLocaleString()}</span>
          )}
        </div>

        <p className="text-[#2C3E2F] text-sm sm:text-base leading-relaxed mb-8">{product.description}</p>
        
        {product.sizes?.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold text-[#6b7c6e] uppercase tracking-wider mb-3">Select Size</p>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map(s => (
                <button key={s.size} disabled={s.stock === 0} onClick={() => setSelectedSize(s.size)}
                  className={`w-11 h-11 text-xs font-semibold rounded-full border transition-all ${
                    s.stock === 0 ? 'bg-[#f0e8da] text-[#9eaa9f] border-[#f0e8da] line-through cursor-not-allowed' :
                    selectedSize === s.size ? 'bg-[#1E3A3A] text-white border-[#1E3A3A] shadow-md scale-105' : 'border-[#E5D9C5] text-[#2C3E2F] hover:border-[#1E3A3A]'
                  }`}>
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button 
          onClick={handleAddToCart}
          disabled={(!selectedSize && product.sizes?.length > 0) || product.stock === 0} 
          className="w-full md:max-w-xs bg-[#C25A3C] hover:bg-[#1E3A3A] text-white font-bold py-4 rounded-full tracking-widest uppercase text-sm shadow-md hover:shadow-lg transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]">
          {product.stock === 0 ? 'Out of Stock' : (selectedSize || !product.sizes?.length ? 'Add to Cart 🛒' : 'Pick a size first!')}
        </button>
      </div>
    </div>
  );
}
