const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');
const { createNotification } = require('../services/notification.service');

// @desc    Get pending events
// @route   GET /api/admin/events/pending
const getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organizer', 'name email')
      .populate('category', 'name color icon')
      .sort('-createdAt');

    ApiResponse.success(res, { events, total: events.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve event
// @route   PUT /api/admin/events/:id/approve
const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('organizer', 'name email fcmToken');

    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    // Notify organizer
    await createNotification({
      recipient: event.organizer._id,
      event: event._id,
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and is now live!`,
      type: 'approval',
    });

    ApiResponse.success(res, { event }, 'Event approved');
  } catch (error) {
    next(error);
  }
};

// @desc    Reject event
// @route   PUT /api/admin/events/:id/reject
const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || '' },
      { new: true }
    ).populate('organizer', 'name email fcmToken');

    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    // Notify organizer
    await createNotification({
      recipient: event.organizer._id,
      event: event._id,
      title: 'Event Rejected',
      message: `Your event "${event.title}" has been rejected. Reason: ${reason || 'No reason provided'}`,
      type: 'approval',
    });

    ApiResponse.success(res, { event }, 'Event rejected');
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEvents,
      pendingEvents,
      totalRegistrations,
      totalCategories,
      usersByRole,
      eventsByStatus,
      recentEvents,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Registration.countDocuments(),
      Category.countDocuments({ isActive: true }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Event.find()
        .populate('organizer', 'name')
        .populate('category', 'name')
        .sort('-createdAt')
        .limit(5),
    ]);

    ApiResponse.success(res, {
      totalUsers,
      totalEvents,
      pendingEvents,
      totalRegistrations,
      totalCategories,
      usersByRole,
      eventsByStatus,
      recentEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    ApiResponse.paginated(res, users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['student', 'organizer', 'admin'].includes(role)) {
      return ApiResponse.badRequest(res, 'Invalid role');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    ApiResponse.success(res, { user }, 'User role updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate report
// @route   GET /api/admin/reports
const generateReport = async (req, res, next) => {
  try {
    const { type = 'overview', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let report = {};

    if (type === 'overview' || type === 'all') {
      const [eventStats, registrationStats, topEvents] = await Promise.all([
        Event.aggregate([
          ...(startDate ? [{ $match: { createdAt: dateFilter } }] : []),
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Registration.aggregate([
          ...(startDate ? [{ $match: { createdAt: dateFilter } }] : []),
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Event.find({ status: 'approved' })
          .sort('-registeredCount')
          .limit(10)
          .select('title registeredCount maxParticipants date'),
      ]);

      report = { eventStats, registrationStats, topEvents };
    }

    if (type === 'attendance' || type === 'all') {
      const attendanceByEvent = await Registration.aggregate([
        { $match: { status: 'attended' } },
        {
          $group: {
            _id: '$event',
            attendedCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: '$event' },
        {
          $project: {
            eventTitle: '$event.title',
            eventDate: '$event.date',
            attendedCount: 1,
            maxParticipants: '$event.maxParticipants',
          },
        },
        { $sort: { attendedCount: -1 } },
        { $limit: 20 },
      ]);

      report.attendanceByEvent = attendanceByEvent;
    }

    ApiResponse.success(res, { report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getDashboardStats,
  getUsers,
  updateUserRole,
  generateReport,
};
