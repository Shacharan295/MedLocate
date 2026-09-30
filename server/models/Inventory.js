const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: [true, 'Pharmacy ID is required'],
      index: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine ID is required'],
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate inventory entries for same pharmacy + medicine combination
inventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });
// Compound index for querying available stock by medicine and price
inventorySchema.index({ medicineId: 1, price: 1, quantity: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
