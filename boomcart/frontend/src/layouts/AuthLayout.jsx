import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] relative flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden">
      
      {/* ── Background ── */}
      <div className="absolute inset-0 w-full h-full z-0 bg-[var(--color-background)]">
        {/* Optional subtle gradient or pattern could go here, but keeping it clean for now */}
      </div>
      
      {/* ── Auth Content Wrapper ── */}
      <div className="relative z-10 w-full flex justify-center">
        
        {/* Subtle top glow effect */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

        <div className="p-8 sm:p-12 flex flex-col w-full">
          {children}
        </div>
        
      </div>
      
      {/* ── Background Floating Logo ── */}
      <div className="absolute bottom-8 left-8 hidden lg:block z-10 opacity-60">
        <span className="font-heading text-3xl font-bold tracking-[0.05em] text-white drop-shadow-md">
          BOOMCART
        </span>
      </div>

    </div>
  );
}
