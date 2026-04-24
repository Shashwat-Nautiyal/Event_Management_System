const Event = require('../models/Event');
const ApiResponse = require('../utils/apiResponse');
const { createNotification } = require('../services/notification.service');

/**
 * Check whether a venue is already booked by a pending or approved event
 * on the same calendar day at the same startTime.
 *
 * @param {string} venue       - Venue name (case-insensitive)
 * @param {Date|string} date   - The event date
 * @param {string} startTime   - "HH:MM" string
 * @param {string} [excludeId] - Event _id to exclude (for updates)
 * @returns {Promise<object|null>} - The conflicting event, or null
 */
const checkVenueConflict = async (venue, date, startTime, excludeId = null) => {
  // Build a [start-of-day, end-of-day] range so that date precision
  // differences (e.g. midnight vs noon) don't cause missed conflicts
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const filter = {
    venue: { $regex: new RegExp(`^${venue.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    date: { $gte: dayStart, $lte: dayEnd },
    startTime,
    status: { $in: ['pending', 'approved'] },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Event.findOne(filter).select('title organizer startTime date');
};

// @desc    Create event
// @route   POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      status: 'pending',
    };

    if (req.file) {
      eventData.bannerImage = `/uploads/${req.file.filename}`;
    }

    // Venue conflict check — reject if another active event occupies
    // the same venue on the same day at the same start time
    if (eventData.venue && eventData.date && eventData.startTime) {
      const conflict = await checkVenueConflict(
        eventData.venue,
        eventData.date,
        eventData.startTime
      );
      if (conflict) {
        return ApiResponse.badRequest(
          res,
          `Venue "${eventData.venue}" is already booked at ${eventData.startTime} on this date`
        );
      }
    }

    const event = await Event.create(eventData);
    const populated = await event.populate([
      { path: 'organizer', select: 'name email' },
      { path: 'category', select: 'name color icon' },
    ]);

    ApiResponse.created(res, { event: populated }, 'Event created and pending approval');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved events (public)
// @route   GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = '-date',
      upcoming,
    } = req.query;

    const query = { status: 'approved' };

    if (category) {
      query.category = category;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .populate('category', 'name color icon')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    ApiResponse.paginated(res, events, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar department')
      .populate('category', 'name color icon');

    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    ApiResponse.success(res, { event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Not authorized to update this event');
    }

    if (req.file) {
      req.body.bannerImage = `/uploads/${req.file.filename}`;
    }

    // If organizer updates an approved event, set back to pending
    if (req.user.role === 'organizer' && event.status === 'approved') {
      req.body.status = 'pending';
    }

    // Venue conflict check — use the incoming value if provided, otherwise
    // fall back to the existing stored value so partial updates still work
    const checkVenue = req.body.venue ?? event.venue;
    const checkDate = req.body.date ?? event.date;
    const checkStartTime = req.body.startTime ?? event.startTime;

    if (checkVenue && checkDate && checkStartTime) {
      const conflict = await checkVenueConflict(
        checkVenue,
        checkDate,
        checkStartTime,
        req.params.id  // exclude this event from its own conflict check
      );
      if (conflict) {
        return ApiResponse.badRequest(
          res,
          `Venue "${checkVenue}" is already booked at ${checkStartTime} on this date`
        );
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('organizer', 'name email avatar')
      .populate('category', 'name color icon');

    ApiResponse.success(res, { event }, 'Event updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Not authorized to delete this event');
    }

    await Event.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Event deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/my-events
const getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status } = req.query;

    const query = { organizer: req.user._id };
    if (status) {
      query.status = status;
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    ApiResponse.paginated(res, events, page, limit, total);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};
