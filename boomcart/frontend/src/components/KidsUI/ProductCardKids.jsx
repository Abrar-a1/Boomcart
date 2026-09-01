import React, { useState } from 'react';

export default function ProductCardKids({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('');
  
  // Calculate total stock remaining to see if totally sold out
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;

  return (
    <div className="group relative bg-white border-2 border-transparent hover:border-yellow-300 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
      
      {/* Playful Image Container */}
      <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative">
        <img 
          src={product.images[0]?.url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {totalStock === 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-xs uppercase shadow-md">
            Sold Out!
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Colorful Meta Tags */}
        <div className="flex items-center gap-2 mb-2">
          {product.ageGroup && (
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{product.ageGroup} Years</span>
          )}
          {product.fabricType && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{product.fabricType}</span>
          )}
        </div>

        <h3 className="font-sans font-bold text-gray-800 text-lg mb-1 leading-tight">{product.name}</h3>
        <p className="text-xl font-black text-gray-900 mb-4">${product.price}</p>
        
        {/* Dynamic Size Picker */}
        <div className="mt-auto">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Pick a Size:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.sizes?.map((sizeObj) => (
              <button
                key={sizeObj.size}
                disabled={sizeObj.stock === 0}
                onClick={() => setSelectedSize(sizeObj.size)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2
                  ${sizeObj.stock === 0 ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through' : ''}
                  ${selectedSize === sizeObj.size ? 'bg-yellow-400 text-navy border-yellow-400 scale-110 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400 hover:text-navy'}
                `}
              >
                {sizeObj.size}
              </button>
            ))}
          </div>

          <button 
            disabled={!selectedSize}
            onClick={() => onAddToCart(product, selectedSize)}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-[0_4px_0_0_rgba(37,99,235,1)] hover:translate-y-1 hover:shadow-[0_0px_0_0_rgba(37,99,235,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_0_rgba(37,99,235,1)]"
          >
            {selectedSize ? `Add to Cart!` : 'Select a size'}
          </button>
        </div>
      </div>
    </div>
  );
}
