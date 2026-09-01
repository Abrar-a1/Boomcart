const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  date: { type: Date, required: true },
  timeSlot: { 
    type: String, 
    required: true,
    enum: [
      '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ]
  },
  address: {
    addressLine1: String, city: String, state: String, pincode: String
  },
  type: { type: String, enum: ['home_try_on', 'virtual'], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

// Prevent double bookings at the database level!
// An appointment is uniquely identified by the date and timeSlot.
appointmentSchema.index({ date: 1, timeSlot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
