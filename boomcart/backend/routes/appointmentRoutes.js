const express = require('express');
const r = express.Router();
const { createAppointment, getMyBookings, getAllBookings, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { appointmentSchemas } = require('../validators');

r.post('/', protect, validate(appointmentSchemas.create), createAppointment);
r.get('/my-bookings', protect, getMyBookings);
r.get('/admin/all', protect, admin, getAllBookings);
r.put('/:id/status', protect, admin, validate(appointmentSchemas.updateStatus), updateAppointmentStatus);

module.exports = r;
