const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const { notifyPharmacyStaff, notifyPatient } = require('./notificationService');

/**
 * Atomically create a reservation and hold inventory stock
 */
const createReservation = async ({ patientId, inventoryId, quantity }) => {
  const reqQty = parseInt(quantity, 10);
  if (isNaN(reqQty) || reqQty <= 0) {
    const error = new Error('Invalid quantity requested. Must be at least 1.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Atomically decrement stock only if available stock is sufficient
  const updatedInventory = await Inventory.findOneAndUpdate(
    { _id: inventoryId, quantity: { $gte: reqQty } },
    { $inc: { quantity: -reqQty } },
    { new: true }
  ).populate('medicineId').populate('pharmacyId');

  // If null, either item doesn't exist or stock was insufficient
  if (!updatedInventory) {
    const exists = await Inventory.findById(inventoryId);
    if (!exists) {
      const error = new Error('Medicine inventory record not found.');
      error.statusCode = 404;
      throw error;
    }
    const error = new Error(`Insufficient stock available. Only ${exists.quantity} units currently in stock.`);
    error.statusCode = 409;
    error.code = 'INSUFFICIENT_STOCK';
    throw error;
  }

  // 2. Calculate canonical pricing and expiry
  const unitPrice = updatedInventory.price;
  const totalAmount = unitPrice * reqQty;
  const holdMinutes = parseInt(process.env.RESERVATION_EXPIRY_MINUTES || '30', 10);
  const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
  const pickupCode = `MED-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // 3. Create reservation record
  const reservation = await Reservation.create({
    patientId,
    pharmacyId: updatedInventory.pharmacyId._id,
    items: [
      {
        medicineId: updatedInventory.medicineId._id,
        medicineName: updatedInventory.medicineId.name,
        quantity: reqQty,
        price: unitPrice
      }
    ],
    totalAmount,
    pickupCode,
    status: 'PENDING',
    expiresAt
  });

  // 4. Low stock alert if stock reached below threshold
  if (updatedInventory.quantity <= updatedInventory.lowStockThreshold) {
    await notifyPharmacyStaff(
      updatedInventory.pharmacyId._id,
      'LOW_STOCK',
      'Low Stock Alert',
      `Medicine "${updatedInventory.medicineId.name}" is running low (${updatedInventory.quantity} left).`,
      { inventoryId: updatedInventory._id, medicineId: updatedInventory.medicineId._id }
    );
  }

  // 5. Notify pharmacy staff of new reservation
  await notifyPharmacyStaff(
    updatedInventory.pharmacyId._id,
    'RESERVATION_CREATED',
    'New Reservation Placed',
    `New reservation for ${reqQty}x ${updatedInventory.medicineId.name} (Code: ${pickupCode}).`,
    { reservationId: reservation._id }
  );

  // 6. Notify patient
  await notifyPatient(
    patientId,
    'RESERVATION_CREATED',
    'Reservation Held',
    `Your reservation for ${updatedInventory.medicineId.name} is confirmed for in-store pickup (Code: ${pickupCode}). Please collect before ${expiresAt.toLocaleTimeString()}.`,
    { reservationId: reservation._id }
  );

  return reservation;
};

/**
 * Release stock back to inventory upon cancellation or expiration
 */
const restoreStockForReservation = async (reservation) => {
  for (const item of reservation.items) {
    await Inventory.findOneAndUpdate(
      { pharmacyId: reservation.pharmacyId, medicineId: item.medicineId },
      { $inc: { quantity: item.quantity } }
    );
  }
};

/**
 * Expire stale reservations and restore inventory
 */
const expireStaleReservations = async () => {
  const now = new Date();
  const staleReservations = await Reservation.find({
    status: 'PENDING',
    expiresAt: { $lt: now }
  });

  let count = 0;
  for (const reservation of staleReservations) {
    reservation.status = 'EXPIRED';
    await reservation.save();
    await restoreStockForReservation(reservation);
    count++;

    // Notify patient
    await notifyPatient(
      reservation.patientId,
      'RESERVATION_EXPIRED',
      'Reservation Expired',
      `Your reservation hold (Code: ${reservation.pickupCode}) has expired and reserved items were returned to stock.`,
      { reservationId: reservation._id }
    );
  }

  if (count > 0) {
    console.log(`[Reservation Service] Cleaned up and restored ${count} expired reservations.`);
  }
  return count;
};

module.exports = {
  createReservation,
  restoreStockForReservation,
  expireStaleReservations
};
