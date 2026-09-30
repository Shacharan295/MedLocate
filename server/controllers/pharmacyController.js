const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');

/**
 * @route   GET /api/pharmacies
 * @desc    Get all registered pharmacies
 * @access  Public
 */
const getPharmacies = async (req, res, next) => {
  try {
    const { verified, search } = req.query;
    const filter = {};

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const pharmacies = await Pharmacy.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/pharmacies/nearby
 * @desc    Find pharmacies near user's geolocation using 2dsphere index
 * @access  Public
 */
const getNearbyPharmacies = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 15 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required.'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const maxMeters = parseFloat(radius) * 1000;

    const nearby = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance: maxMeters,
          spherical: true
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          phone: 1,
          location: 1,
          verified: 1,
          distanceKm: {
            $round: [{ $divide: ['$distanceMeters', 1000] }, 2]
          }
        }
      },
      { $sort: { distanceKm: 1 } },
      { $limit: 30 }
    ]);

    return res.status(200).json({
      success: true,
      count: nearby.length,
      data: nearby
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/pharmacies/:id
 * @desc    Get pharmacy details with available medicines
 * @access  Public
 */
const getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found.' });
    }

    const inventory = await Inventory.find({ pharmacyId: pharmacy._id, quantity: { $gt: 0 } })
      .populate('medicineId')
      .sort({ price: 1 });

    return res.status(200).json({
      success: true,
      data: {
        pharmacy,
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/pharmacies/:id/verification
 * @desc    Admin approve or reject pharmacy verification
 * @access  Private (Admin)
 */
const updatePharmacyVerification = async (req, res, next) => {
  try {
    const { verified } = req.body;
    if (verified === undefined) {
      return res.status(400).json({ success: false, message: 'Verified boolean status required.' });
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { verified: Boolean(verified) },
      { new: true }
    );

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Pharmacy verification updated to ${pharmacy.verified}`,
      data: pharmacy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/pharmacies/:id
 * @desc    Update pharmacy details (owner or admin)
 * @access  Private
 */
const updatePharmacyProfile = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found.' });
    }

    if (req.user.role === 'pharmacy' && pharmacy.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const { name, address, phone, latitude, longitude } = req.body;
    if (name) pharmacy.name = name;
    if (address) pharmacy.address = address;
    if (phone) pharmacy.phone = phone;

    if (latitude !== undefined && longitude !== undefined) {
      pharmacy.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    await pharmacy.save();
    return res.status(200).json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPharmacies,
  getNearbyPharmacies,
  getPharmacyById,
  updatePharmacyVerification,
  updatePharmacyProfile
};
