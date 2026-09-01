import api from './api';

class BookingService {
  /**
   * Submits a booking to the database
   * @param {Object} bookingData - date, timeSlot, type, address, productId
   * @returns {Promise} Axios response
   */
  bookAppointment(bookingData) {
    return api.post('/appointments', bookingData);
  }

  /**
   * Fetches actively confirmed/pending bookings for the logged-in user
   * @returns {Promise} Axios response
   */
  getUserBookings() {
    return api.get('/appointments/my-bookings');
  }
}

export default new BookingService();
