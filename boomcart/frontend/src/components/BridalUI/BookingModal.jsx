import React, { useState } from 'react';
import { bookAppointment } from '../../services/api';

export default function BookingModal({ productId, onClose }) {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '10:00 AM',
    type: 'home_try_on',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        productId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        type: formData.type,
      };
      
      // Joi Validation requires address for home_try_on
      if (formData.type === 'home_try_on') {
        payload.address = {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        };
      }

      await bookAppointment(payload);
      alert('Bridal Appointment Confirmed Successfully!');
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-navy text-2xl font-sans">&times;</button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-navy mb-2">Reserve a Consultation</h2>
          <p className="text-gray-500 text-sm">Experience luxury tailoring with an expert stylist.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]} 
                className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-navy font-medium focus:ring-2 focus:ring-gold focus:outline-none"
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time Slot</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-navy font-medium focus:ring-2 focus:ring-gold focus:outline-none"
                value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}>
                {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({...formData, type: 'virtual'})}
                className={`p-3 border rounded text-sm font-medium transition ${formData.type==='virtual' ? 'bg-navy text-gold border-navy' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                Virtual Session
              </button>
              <button type="button" onClick={() => setFormData({...formData, type: 'home_try_on'})}
                className={`p-3 border rounded text-sm font-medium transition ${formData.type==='home_try_on' ? 'bg-navy text-gold border-navy' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                Home Try-on
              </button>
            </div>
          </div>

          {formData.type === 'home_try_on' && (
            <div className="space-y-4 animate-fade-in mt-4 bg-gray-50 p-4 rounded border border-gray-100">
               <input type="text" placeholder="Street Address" required className="w-full border-b border-gray-200 bg-transparent p-2 focus:outline-none focus:border-navy" value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})}/>
               <div className="grid grid-cols-3 gap-3">
                 <input type="text" placeholder="City" required className="w-full border-b border-gray-200 bg-transparent p-2 focus:outline-none focus:border-navy" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/>
                 <input type="text" placeholder="State/Prov" required className="w-full border-b border-gray-200 bg-transparent p-2 focus:outline-none focus:border-navy" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}/>
                 <input type="text" placeholder="ZIP/Pincode" required className="w-full border-b border-gray-200 bg-transparent p-2 focus:outline-none focus:border-navy" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})}/>
               </div>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-navy text-gold font-serif text-lg py-4 rounded hover:bg-navy-light transition disabled:opacity-50 mt-6 shadow-md hover:shadow-lg">
            {loading ? 'Confirming...' : 'Secure Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
