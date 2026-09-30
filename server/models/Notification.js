const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'RESERVATION_CREATED',
        'RESERVATION_CONFIRMED',
        'RESERVATION_CANCELLED',
        'RESERVATION_EXPIRED',
        'RESERVATION_PICKED_UP'
      ],
      required: true
    },
    title: {
      type: String,
      default: 'Notification'
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
      pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
