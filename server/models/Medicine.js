const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      index: true
    },
    genericName: {
      type: String,
      required: [true, 'Generic name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true,
      default: 'Standard Pharmaceutical'
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for flexible keyword search
medicineSchema.index({ name: 'text', genericName: 'text', category: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
