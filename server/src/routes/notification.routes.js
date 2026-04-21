const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, sendNotification } = require('../controllers/notification.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, authorize('organizer', 'admin'), sendNotification);

module.exports = router;
