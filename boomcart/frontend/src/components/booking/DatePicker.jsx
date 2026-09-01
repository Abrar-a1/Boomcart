import React from 'react';

export default function DatePicker({ value, onChange }) {
  // Prevent booking in the past
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">
        Select Date
      </label>
      <input 
        type="date" 
        required 
        min={today}
        className="w-full bg-[#fdfbf7] border border-[#f0ece6] rounded-md p-3.5 text-[#2c2825] font-serif focus:border-[#d9cbb8] focus:ring-1 focus:ring-[#d9cbb8] focus:outline-none transition-all"
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}
