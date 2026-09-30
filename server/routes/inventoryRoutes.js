const express = require('express');
const router = express.Router();
const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  syncPOSInventory
} = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('pharmacy', 'admin'), getInventory);
router.post('/', authorizeRoles('pharmacy', 'admin'), createInventory);
router.post('/sync', authorizeRoles('pharmacy'), syncPOSInventory);
router.put('/:id', authorizeRoles('pharmacy', 'admin'), updateInventory);
router.delete('/:id', authorizeRoles('pharmacy', 'admin'), deleteInventory);

module.exports = router;
