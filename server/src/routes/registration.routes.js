const express = require('express');
const {
  registerForEvent,
  cancelRegistration,
  getMyTickets,
  getEventParticipants,
  verifyQR,
} = require('../controllers/registration.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.get('/my-tickets', protect, getMyTickets);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventParticipants);
router.post('/verify-qr', protect, authorize('organizer', 'admin'), verifyQR);
router.post('/:eventId', protect, registerForEvent);
router.delete('/:eventId', protect, cancelRegistration);

module.exports = router;
