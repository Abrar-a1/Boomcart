import React, { useState } from 'react';
import DatePicker from './DatePicker';
import TimeSlotSelector from './TimeSlotSelector';
import AddressForm from './AddressForm';
import { useStore } from '../../store/useStore';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

export default function BookingModal({ productId, onClose }) {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '10:00 AM',
    type: 'virtual', // virtual | home_try_on
    address: {}
  });

  const setBooking = useStore(state => state.setBooking);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.timeSlot) {
      toast.error('Date and Time are absolutely required.');
      return;
    }
    
    if (formData.type === 'home_try_on' && (!formData.address?.addressLine1 || !formData.address?.city)) {
      toast.error('Address metrics are required for Home Try-On.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, productId };
      
      // Hit cleanly abstracted Service Layer
      await bookingService.bookAppointment(payload);
      
      // Cache actively into Zustand
      setBooking(payload);
      
      toast.success('Booking request submitted. Await confirmation.', { duration: 4500 });
      
      // Form reset logic
      setFormData({ date: '', timeSlot: '10:00 AM', type: 'virtual', address: {} });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-lg w-full shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8176] hover:text-[#2c2825] text-2xl font-light transition">&times;</button>
        
        <div className="mb-8 text-center border-b border-[#f0ece6] pb-6">
          <h2 className="text-2xl font-serif text-[#2c2825] tracking-wide mb-2 uppercase">Reserve Experience</h2>
          <p className="text-[#8a8176] text-sm font-sans italic">Secure your personalized styling consultation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <DatePicker value={formData.date} onChange={(val) => setFormData({...formData, date: val})} />
          
          <TimeSlotSelector value={formData.timeSlot} onChange={(val) => setFormData({...formData, timeSlot: val})} />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">Experience Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({...formData, type: 'virtual'})}
                className={`p-3 text-sm font-serif border transition-all ${formData.type==='virtual' ? 'bg-[#2c2825] text-[#fdfbf7] border-[#2c2825] shadow-md' : 'bg-white text-[#8a8176] border-[#f0ece6] hover:border-[#d9cbb8]'}`}>
                Virtual Session
              </button>
              <button type="button" onClick={() => setFormData({...formData, type: 'home_try_on'})}
                className={`p-3 text-sm font-serif border transition-all ${formData.type==='home_try_on' ? 'bg-[#2c2825] text-[#fdfbf7] border-[#2c2825] shadow-md' : 'bg-white text-[#8a8176] border-[#f0ece6] hover:border-[#d9cbb8]'}`}>
                Home Try-on
              </button>
            </div>
          </div>

          {formData.type === 'home_try_on' && (
            <AddressForm address={formData.address} onChange={(val) => setFormData({...formData, address: val})} />
          )}

          <button disabled={loading || !formData.date || !formData.timeSlot} type="submit" 
            className="w-full bg-[#2c2825] text-[#fdfbf7] font-serif uppercase tracking-widest text-sm py-4 hover:bg-[#1a1816] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4">
            {loading ? 'Confirming...' : 'Confirm Availability'}
          </button>
        </form>
      </div>
    </div>
  );
}
