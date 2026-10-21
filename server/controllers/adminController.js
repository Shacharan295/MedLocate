const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with role filtering & search
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .populate('pharmacyId', 'name address verified')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/pharmacies
 * @desc    Get pharmacies with detailed status
 * @access  Private (Admin)
 */
const getAdminPharmacies = async (req, res, next) => {
  try {
    const { verified } = req.query;
    const filter = {};

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const pharmacies = await Pharmacy.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

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
 * @route   GET /api/admin/reports
 * @desc    Comprehensive platform analytics & metrics
 * @access  Private (Admin)
 */
const getAdminReports = async (req, res, next) => {
  try {
    const [
      totalUsers,
      patientCount,
      pharmacyUserCount,
      totalPharmacies,
      verifiedPharmacies,
      pendingPharmacies,
      totalMedicines,
      totalReservations,
      activeReservations,
      completedReservations,
      cancelledReservations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'pharmacy' }),
      Pharmacy.countDocuments(),
      Pharmacy.countDocuments({ verified: true }),
      Pharmacy.countDocuments({ verified: false }),
      Medicine.countDocuments(),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } }),
      Reservation.countDocuments({ status: 'PICKED_UP' }),
      Reservation.countDocuments({ status: { $in: ['CANCELLED', 'EXPIRED'] } })
    ]);

    // Calculate total reservation order value
    const revenueAgg = await Reservation.aggregate([
      { $match: { status: 'PICKED_UP' } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);

    const totalSales = revenueAgg[0]?.totalSales || 0;

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          patients: patientCount,
          pharmacyUsers: pharmacyUserCount
        },
        pharmacies: {
          total: totalPharmacies,
          verified: verifiedPharmacies,
          pending: pendingPharmacies
        },
        medicines: {
          total: totalMedicines
        },
        reservations: {
          total: totalReservations,
          active: activeReservations,
          completed: completedReservations,
          cancelledOrExpired: cancelledReservations,
          totalSales: parseFloat(totalSales.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/seed
 * @desc    Re-seed platform database with demo data
 * @access  Private (Admin)
 */
const postSeed = async (req, res, next) => {
  try {
    const { seedData } = require('../scripts/seed');
    await seedData({ clearExisting: true });
    return res.status(200).json({ success: true, message: 'Database successfully re-seeded.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getAdminPharmacies,
  getAdminReports,
  postSeed
};
