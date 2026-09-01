const asyncHandler = require('express-async-handler');
const appointmentService = require('../services/appointmentService');

// POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const appointmentData = { ...req.body, userId: req.user._id };
  // The service handles duplicate booking validation natively
  const appointment = await appointmentService.createAppointment(appointmentData);
  res.status(201).json({ success: true, data: appointment });
});

// GET /api/appointments/my-bookings
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await appointmentService.getUserBookings(req.user._id);
  res.json({ success: true, count: bookings.length, data: bookings });
});

// GET /api/appointments/admin/all
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await appointmentService.getAllBookings(req.query);
  res.json({ success: true, count: bookings.length, data: bookings });
});

// PUT /api/appointments/:id/status
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentStatus(req.params.id, req.body.status);
  res.json({ success: true, message: `Appointment ${req.body.status}`, data: appointment });
});
