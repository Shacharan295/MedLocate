const express = require('express');
const router = express.Router();
const {
  createReservationHandler,
  getReservations,
  getReservationById,
  updateReservationStatus
} = require('../controllers/reservationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.post('/', authorizeRoles('patient'), createReservationHandler);
router.get('/', getReservations);
router.get('/:id', getReservationById);
router.patch('/:id', updateReservationStatus);

module.exports = router;
