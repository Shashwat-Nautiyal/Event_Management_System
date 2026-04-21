const express = require('express');
const multer = require('multer');
const path = require('path');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getMyEvents } = require('../controllers/event.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

// Multer config for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `event-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Public routes
router.get('/', getEvents);
router.get('/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, authorize('organizer', 'admin'), upload.single('bannerImage'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('bannerImage'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
