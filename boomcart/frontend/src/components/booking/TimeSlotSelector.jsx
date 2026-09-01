import React from 'react';

const SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

export default function TimeSlotSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">
        Time Slot
      </label>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map(slot => (
          <button
            key={slot}
            type="button"
            onClick={() => onChange(slot)}
            className={`py-2 text-sm font-serif border transition-all ${
              value === slot 
                ? 'bg-[#2c2825] text-[#fdfbf7] border-[#2c2825]' 
                : 'bg-white text-[#8a8176] border-[#f0ece6] hover:border-[#d9cbb8]'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
