const Reservation = require('../models/Reservation');
const { createReservation, restoreStockForReservation } = require('../services/reservationService');
const { notifyPatient, notifyPharmacyStaff } = require('../services/notificationService');

/**
 * @route   POST /api/reservations
 * @desc    Create a new medicine reservation hold
 * @access  Private (Patient)
 */
const createReservationHandler = async (req, res, next) => {
  try {
    const { inventoryId, quantity } = req.body;
    const patientId = req.user.id;

    if (!inventoryId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Inventory ID and quantity are required.'
      });
    }

    const reservation = await createReservation({
      patientId,
      inventoryId,
      quantity
    });

    return res.status(201).json({
      success: true,
      message: 'Reservation hold confirmed. Please pick up at the pharmacy before expiry.',
      data: reservation
    });
  } catch (error) {
    if (error.statusCode === 409 || error.code === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({
        success: false,
        code: 'INSUFFICIENT_STOCK',
        message: error.message || 'Sorry, this medicine is no longer available in the requested quantity.'
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/reservations
 * @desc    Get reservations for current user (patient, pharmacy, admin)
 * @access  Private
 */
const getReservations = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }

    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'pharmacy') {
      if (!req.user.pharmacyId) {
        return res.status(400).json({ success: false, message: 'Pharmacy profile missing.' });
      }
      query.pharmacyId = req.user.pharmacyId;
    }
    // Admin gets all if neither patient nor pharmacy

    const reservations = await Reservation.find(query)
      .populate('patientId', 'name email phone')
      .populate('pharmacyId', 'name address phone location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reservations/:id
 * @desc    Get reservation by ID
 * @access  Private
 */
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('pharmacyId', 'name address phone location');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    // Authorization check
    const patientOwnerId = reservation.patientId?._id ? reservation.patientId._id.toString() : reservation.patientId?.toString();
    const pharmacyOwnerId = reservation.pharmacyId?._id ? reservation.pharmacyId._id.toString() : reservation.pharmacyId?.toString();

    if (req.user.role === 'patient' && patientOwnerId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'pharmacy' && pharmacyOwnerId !== req.user.pharmacyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/reservations/:id
 * @desc    Update reservation status (CONFIRM, CANCEL, PICKED_UP)
 * @access  Private (Pharmacy, Admin, or Patient for self-cancellation)
 */
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['CONFIRMED', 'CANCELLED', 'PICKED_UP'];

    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    // Role & Ownership checks
    const targetStatus = status.toUpperCase();
    const isPatientOwner = reservation.patientId.toString() === req.user.id;
    const isPharmacyOwner = req.user.pharmacyId && reservation.pharmacyId.toString() === req.user.pharmacyId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPharmacyOwner && !isAdmin && !isPatientOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this reservation.' });
    }

    // Patient can only cancel their own reservation
    if (isPatientOwner && !isPharmacyOwner && !isAdmin && targetStatus !== 'CANCELLED') {
      return res.status(403).json({ success: false, message: 'Patients can only cancel reservations.' });
    }

    // Check if reservation is already in a terminal state
    if (['CANCELLED', 'PICKED_UP', 'EXPIRED'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update reservation. Current status is already ${reservation.status}.`
      });
    }

    // If cancelling, restore stock!
    if (targetStatus === 'CANCELLED') {
      await restoreStockForReservation(reservation);

      await notifyPatient(
        reservation.patientId,
        'RESERVATION_CANCELLED',
        'Reservation Cancelled',
        `Reservation ${reservation.pickupCode} was cancelled.`,
        { reservationId: reservation._id }
      );
      await notifyPharmacyStaff(
        reservation.pharmacyId,
        'RESERVATION_CANCELLED',
        'Reservation Cancelled',
        `Reservation ${reservation.pickupCode} was cancelled and inventory restored.`,
        { reservationId: reservation._id }
      );
    } else if (targetStatus === 'CONFIRMED') {
      await notifyPatient(
        reservation.patientId,
        'RESERVATION_CONFIRMED',
        'Reservation Ready for Pickup',
        `Your reservation ${reservation.pickupCode} is confirmed and packaged. Ready for pickup!`,
        { reservationId: reservation._id }
      );
    } else if (targetStatus === 'PICKED_UP') {
      await notifyPatient(
        reservation.patientId,
        'RESERVATION_PICKED_UP',
        'Medicine Picked Up',
        `Thank you for picking up reservation ${reservation.pickupCode}. Order completed.`,
        { reservationId: reservation._id }
      );
    }

    reservation.status = targetStatus;
    await reservation.save();

    const populated = await Reservation.findById(reservation._id)
      .populate('patientId', 'name email phone')
      .populate('pharmacyId', 'name address phone location');

    return res.status(200).json({
      success: true,
      message: `Reservation status updated to ${targetStatus}.`,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservationHandler,
  getReservations,
  getReservationById,
  updateReservationStatus
};
