import React from 'react';

export default function AddressForm({ address, onChange }) {
  
  const handleChange = (field, value) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4 animate-fade-in mt-2 bg-[#fdfbf7] p-5 rounded-md border border-[#f0ece6]">
      <h4 className="font-serif text-sm text-[#8a8176] mb-3 border-b border-[#f0ece6] pb-2">Home Try-On Destination</h4>
      
      <input 
        type="text" 
        placeholder="Street Address" 
        required 
        className="w-full border-b border-[#e2dfd9] bg-transparent p-2.5 focus:outline-none focus:border-[#2c2825] font-sans text-sm text-[#2c2825] placeholder-[#c9c5bd] transition-colors" 
        value={address.addressLine1 || ''} 
        onChange={e => handleChange('addressLine1', e.target.value)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="text" 
          placeholder="City" 
          required 
          className="w-full border-b border-[#e2dfd9] bg-transparent p-2.5 focus:outline-none focus:border-[#2c2825] font-sans text-sm text-[#2c2825] placeholder-[#c9c5bd] transition-colors" 
          value={address.city || ''} 
          onChange={e => handleChange('city', e.target.value)}
        />
        <input 
          type="text" 
          placeholder="State/Prov" 
          required 
          className="w-full border-b border-[#e2dfd9] bg-transparent p-2.5 focus:outline-none focus:border-[#2c2825] font-sans text-sm text-[#2c2825] placeholder-[#c9c5bd] transition-colors" 
          value={address.state || ''} 
          onChange={e => handleChange('state', e.target.value)}
        />
        <input 
          type="text" 
          placeholder="ZIP/Pincode" 
          required 
          className="w-full border-b border-[#e2dfd9] bg-transparent p-2.5 focus:outline-none focus:border-[#2c2825] font-sans text-sm text-[#2c2825] placeholder-[#c9c5bd] transition-colors" 
          value={address.pincode || ''} 
          onChange={e => handleChange('pincode', e.target.value)}
        />
      </div>
    </div>
  );
}
