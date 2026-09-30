const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  searchMedicines
} = require('../controllers/medicineController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/search', searchMedicines);
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', authenticateToken, authorizeRoles('pharmacy', 'admin'), createMedicine);

module.exports = router;
