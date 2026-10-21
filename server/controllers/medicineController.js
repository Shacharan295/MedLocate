const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');

/**
 * @route   GET /api/medicines
 * @desc    Get all medicines in the global catalog
 * @access  Public
 */
const getMedicines = async (req, res, next) => {
  try {
    const { search, category, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const medicines = await Medicine.find(filter).limit(parseInt(limit, 10)).sort({ name: 1 });
    return res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/medicines/:id
 * @desc    Get medicine by ID
 * @access  Public
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }
    return res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/medicines
 * @desc    Add a new medicine to the catalog
 * @access  Private (Admin / Pharmacy)
 */
const createMedicine = async (req, res, next) => {
  try {
    const { name, genericName, category, manufacturer, description } = req.body;
    if (!name || !genericName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, generic name, and category are required.'
      });
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      category,
      manufacturer,
      description
    });

    return res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/medicines/search
 * @desc    Search for medicines and return nearby pharmacies with live stock, distance, price
 * @access  Public
 */
const searchMedicines = async (req, res, next) => {
  try {
    const {
      medicine: medicineQuery,
      query,
      latitude,
      longitude,
      radius = 25, // radius in km
      sort = 'distance', // 'distance', 'price', 'availability'
      emergency = 'false'
    } = req.query;

    const searchTerm = (medicineQuery || query || '').trim();
    const isEmergency = emergency === 'true';
    const effectiveRadius = parseFloat(radius) || (isEmergency ? 35 : 15);

    // 1. Locate matching medicines in catalog
    const medicineFilter = {};
    if (searchTerm) {
      medicineFilter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { genericName: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const matchingMedicines = await Medicine.find(medicineFilter).select('_id name genericName category manufacturer');
    if (!matchingMedicines.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        searchedRadiusKm: effectiveRadius,
        emergencyMode: isEmergency,
        data: [],
        message: 'No medicine matching the search query was found in the catalog.'
      });
    }

    const medicineIds = matchingMedicines.map(m => m._id);

    // 2. Geospatial aggregation on Pharmacies
    const hasCoordinates = latitude !== undefined && longitude !== undefined && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
    const userLat = hasCoordinates ? parseFloat(latitude) : 13.0827; // Chennai fallback
    const userLng = hasCoordinates ? parseFloat(longitude) : 80.2707;
    const maxMeters = effectiveRadius * 1000;

    const pipeline = [];

    // Stage 1: Geospatial proximity if coordinates provided
    if (hasCoordinates) {
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [userLng, userLat] },
          distanceField: 'distanceMeters',
          maxDistance: maxMeters,
          spherical: true
        }
      });
    }

    // Stage 2: Join with Inventory for matching medicines with available stock (> 0)
    pipeline.push(
      {
        $lookup: {
          from: 'inventories',
          let: { pharmacyId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$pharmacyId', '$$pharmacyId'] },
                    { $in: ['$medicineId', medicineIds] },
                    { $gt: ['$quantity', 0] }
                  ]
                }
              }
            }
          ],
          as: 'inventoryList'
        }
      },
      { $unwind: '$inventoryList' },
      // Stage 3: Join Medicine details
      {
        $lookup: {
          from: 'medicines',
          localField: 'inventoryList.medicineId',
          foreignField: '_id',
          as: 'medicineDetails'
        }
      },
      { $unwind: '$medicineDetails' }
    );

    // Stage 4: Project uniform response format
    pipeline.push({
      $project: {
        _id: '$inventoryList._id',
        inventoryId: '$inventoryList._id',
        pharmacy: {
          id: '$_id',
          name: '$name',
          address: '$address',
          phone: '$phone',
          location: '$location',
          verified: '$verified',
          rating: { $ifNull: ['$rating', 4.5] },
          openingHours: { $ifNull: ['$openingHours', '8:00 AM - 10:00 PM'] }
        },
        medicine: {
          id: '$medicineDetails._id',
          name: '$medicineDetails.name',
          genericName: '$medicineDetails.genericName',
          category: '$medicineDetails.category',
          manufacturer: '$medicineDetails.manufacturer'
        },
        quantity: '$inventoryList.quantity',
        price: '$inventoryList.price',
        distanceMeters: { $ifNull: ['$distanceMeters', 0] },
        distanceKm: {
          $round: [
            { $divide: [{ $ifNull: ['$distanceMeters', 0] }, 1000] },
            2
          ]
        },
        verified: '$verified'
      }
    });

    // Stage 5: Dynamic Sorting
    if (isEmergency) {
      // In Emergency Mode: prioritize verified pharmacies with higher available stock, closest distance
      pipeline.push({ $sort: { verified: -1, quantity: -1, distanceKm: 1 } });
    } else if (sort === 'price') {
      pipeline.push({ $sort: { price: 1, distanceKm: 1 } });
    } else if (sort === 'availability') {
      pipeline.push({ $sort: { quantity: -1, distanceKm: 1 } });
    } else {
      // Default: sort by proximity, then verified pharmacies first
      pipeline.push({ $sort: { distanceKm: 1, verified: -1, price: 1 } });
    }

    pipeline.push({ $limit: 40 });

    const results = await Pharmacy.aggregate(pipeline);

    // If zero pharmacies have stock and coordinates available, check if verified nearby pharmacies/emergency desks exist
    let nearbyVerifiedFacilities = [];
    if (results.length === 0 && hasCoordinates) {
      nearbyVerifiedFacilities = await Pharmacy.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [userLng, userLat] },
            distanceField: 'distanceMeters',
            maxDistance: maxMeters,
            spherical: true
          }
        },
        { $match: { verified: true } },
        {
          $project: {
            name: 1,
            address: 1,
            phone: 1,
            distanceKm: {
              $round: [{ $divide: ['$distanceMeters', 1000] }, 2]
            }
          }
        },
        { $limit: 3 }
      ]);
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      searchedRadiusKm: effectiveRadius,
      emergencyMode: isEmergency,
      data: results,
      fallbackFacilities: nearbyVerifiedFacilities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  searchMedicines
};
