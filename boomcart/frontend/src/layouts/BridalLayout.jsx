import React from 'react';

export default function BridalLayout({ children }) {
  return (
    <div className="w-full bg-[#fcfbf9] font-serif selection:bg-[#e0d6c8] py-8">
      <div className="bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-[#f0ece6] p-8 md:p-16 mb-16">
         {children}
      </div>
    </div>
  );
}
