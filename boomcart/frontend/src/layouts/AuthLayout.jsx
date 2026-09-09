import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-[var(--color-background)]">
      {/* ── Left Side: Visual / Editorial ── */}
      <div className="w-full lg:w-1/2 h-48 lg:h-full relative overflow-hidden shrink-0">
        <img 
          src="/images/category-women.png" 
          alt="Boomcart Luxury Fashion" 
          className="absolute inset-0 w-full h-full object-cover object-top lg:object-center"
        />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        
        {/* Editorial Content (Desktop Only) */}
        <div className="absolute inset-0 hidden lg:flex flex-col items-center justify-center text-center p-12 bg-black/20">
          <Link to="/" className="font-heading text-4xl lg:text-5xl font-bold tracking-[0.05em] text-white hover:opacity-90 transition-opacity mb-8 drop-shadow-md">
            BOOMCART
          </Link>
          <p className="font-heading text-2xl text-white/90 italic max-w-sm drop-shadow-sm">
            "Timeless pieces, made for every occasion."
          </p>
        </div>

        {/* Mobile Header Link */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 lg:hidden font-heading text-2xl font-bold tracking-[0.05em] text-white drop-shadow-md z-10"
        >
          BOOMCART
        </Link>
      </div>

      {/* ── Right Side: Functional Form ── */}
      <div className="w-full lg:w-1/2 flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-sm animate-smooth-reveal">
          {children}
        </div>
      </div>
    </div>
  );
}
