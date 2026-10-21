const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAdminPharmacies,
  getAdminReports,
  postSeed
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.get('/pharmacies', getAdminPharmacies);
router.get('/reports', getAdminReports);
router.post('/seed', postSeed);

module.exports = router;
