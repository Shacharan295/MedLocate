const express = require('express');
const router = express.Router();
const {
  getPharmacies,
  getNearbyPharmacies,
  getPharmacyById,
  updatePharmacyVerification,
  updatePharmacyProfile
} = require('../controllers/pharmacyController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/nearby', getNearbyPharmacies);
router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);

router.patch('/:id/verification', authenticateToken, authorizeRoles('admin'), updatePharmacyVerification);
router.put('/:id', authenticateToken, authorizeRoles('pharmacy', 'admin'), updatePharmacyProfile);

module.exports = router;
