const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Pharmacy name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required']
      }
    },
    verified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },
    openingHours: {
      type: String,
      default: '8:00 AM - 10:00 PM'
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for geospatial proximity queries ($near, $geoNear)
pharmacySchema.index({ location: '2dsphere' });
pharmacySchema.index({ verified: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
