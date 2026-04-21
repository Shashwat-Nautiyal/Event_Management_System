const express = require('express');
const {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getDashboardStats,
  getUsers,
  updateUserRole,
  generateReport,
} = require('../controllers/admin.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/events/pending', getPendingEvents);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/reports', generateReport);

module.exports = router;
