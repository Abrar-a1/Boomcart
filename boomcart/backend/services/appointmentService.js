const Appointment = require('../models/Appointment');

class AppointmentService {
  async createAppointment(appointmentData) {
    // 1. Business Logic: Normalize date to strip arbitrary time hours for uniform indexing
    const bookingDate = new Date(appointmentData.date);
    bookingDate.setHours(0, 0, 0, 0);
    
    // Validate that the normalized booking date is not before today's date (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      throw new Error('Appointment date cannot be in the past.');
    }
    
    // 2. Validate double booking explicitly before Mongoose throws the 11000 duplicate key
    const conflicting = await Appointment.findOne({ 
      date: bookingDate, 
      timeSlot: appointmentData.timeSlot,
      status: { $ne: 'cancelled' } // Cancelled slots can be double booked!
    });

    if (conflicting) {
      throw new Error(`The slot for ${appointmentData.timeSlot} is already booked.`);
    }

    // 3. Create
    return await Appointment.create({
      ...appointmentData,
      date: bookingDate
    });
  }

  async getUserBookings(userId) {
    return await Appointment.find({ userId }).populate('productId', 'name images price').sort('-date');
  }

  async getAllBookings(filters) {
    return await Appointment.find(filters).populate('userId', 'name email').populate('productId', 'name').sort('-date');
  }

  async updateAppointmentStatus(appointmentId, status) {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId, 
      { status }, 
      { new: true, runValidators: true }
    );
    if (!appointment) throw new Error('Appointment not found');
    return appointment;
  }
}

module.exports = new AppointmentService();
