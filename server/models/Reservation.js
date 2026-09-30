const mongoose = require('mongoose');

const reservationItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicineName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const reservationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: [true, 'Pharmacy ID is required'],
      index: true
    },
    items: {
      type: [reservationItemSchema],
      required: true,
      validate: [val => val.length > 0, 'Reservation must contain at least one medicine item']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    pickupCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'PICKED_UP', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying active reservations and background expiry sweeps
reservationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
