import React from 'react';

export default function KidsLayout({ children }) {
  return (
    <div className="w-full bg-yellow-50 selection:bg-blue-200 py-6">
      <div className="border-t-8 border-t-yellow-400 w-full mb-6" />
      <div className="bg-white rounded-3xl shadow-sm border border-yellow-100 p-6 md:p-10 mb-10 overflow-hidden">
         {children}
      </div>
    </div>
  );
}
