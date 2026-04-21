const Registration = require('../models/Registration');
const Event = require('../models/Event');
const ApiResponse = require('../utils/apiResponse');
const { generateTicketId, generateQRData, generateQRCodeDataURL, verifyQRData } = require('../services/qr.service');
const { createNotification } = require('../services/notification.service');

// @desc    Register for event
// @route   POST /api/registrations/:eventId
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    if (event.status !== 'approved') {
      return ApiResponse.badRequest(res, 'Event is not available for registration');
    }

    if (event.date < new Date()) {
      return ApiResponse.badRequest(res, 'Event has already passed');
    }

    if (event.registeredCount >= event.maxParticipants) {
      return ApiResponse.badRequest(res, 'Event is full');
    }

    // Check if already registered
    const existingReg = await Registration.findOne({ event: eventId, user: userId });
    if (existingReg) {
      if (existingReg.status === 'cancelled') {
        // Re-register
        existingReg.status = 'confirmed';
        existingReg.ticketId = generateTicketId();
        const qrData = generateQRData(existingReg.ticketId, eventId, userId.toString());
        existingReg.qrCodeData = await generateQRCodeDataURL(qrData);
        await existingReg.save();

        event.registeredCount += 1;
        await event.save();

        return ApiResponse.success(res, { registration: existingReg }, 'Re-registered successfully');
      }
      return ApiResponse.badRequest(res, 'Already registered for this event');
    }

    // Generate ticket
    const ticketId = generateTicketId();
    const qrData = generateQRData(ticketId, eventId, userId.toString());
    const qrCodeDataURL = await generateQRCodeDataURL(qrData);

    const registration = await Registration.create({
      event: eventId,
      user: userId,
      ticketId,
      qrCodeData: qrCodeDataURL,
    });

    // Update registered count
    event.registeredCount += 1;
    await event.save();

    // Create notification
    await createNotification({
      recipient: userId,
      event: eventId,
      title: 'Registration Confirmed',
      message: `You have been registered for "${event.title}". Your ticket ID: ${ticketId}`,
      type: 'registration',
    });

    const populated = await registration.populate([
      { path: 'event', select: 'title date venue startTime endTime bannerImage' },
      { path: 'user', select: 'name email' },
    ]);

    ApiResponse.created(res, { registration: populated }, 'Registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:eventId
const cancelRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      event: eventId,
      user: userId,
      status: 'confirmed',
    });

    if (!registration) {
      return ApiResponse.notFound(res, 'Registration not found');
    }

    registration.status = 'cancelled';
    await registration.save();

    // Update registered count
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });

    ApiResponse.success(res, null, 'Registration cancelled');
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's registrations
// @route   GET /api/registrations/my-tickets
const getMyTickets = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const registrations = await Registration.find(query)
      .populate({
        path: 'event',
        select: 'title date venue startTime endTime bannerImage status category',
        populate: { path: 'category', select: 'name color icon' },
      })
      .sort('-createdAt');

    let result = registrations;

    if (upcoming === 'true') {
      result = registrations.filter(
        (r) => r.event && new Date(r.event.date) >= new Date()
      );
    }

    ApiResponse.success(res, { registrations: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get participants for an event
// @route   GET /api/registrations/event/:eventId
const getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return ApiResponse.notFound(res, 'Event not found');
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Not authorized to view participants');
    }

    const registrations = await Registration.find({
      event: eventId,
      status: { $ne: 'cancelled' },
    })
      .populate('user', 'name email phone department')
      .sort('-createdAt');

    ApiResponse.success(res, {
      participants: registrations,
      total: registrations.length,
      attended: registrations.filter((r) => r.status === 'attended').length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR code at check-in
// @route   POST /api/registrations/verify-qr
const verifyQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    const verification = verifyQRData(qrData);
    if (!verification.valid) {
      return ApiResponse.badRequest(res, verification.error);
    }

    const { ticketId, eventId } = verification.data;

    const registration = await Registration.findOne({ ticketId })
      .populate('user', 'name email department')
      .populate('event', 'title organizer');

    if (!registration) {
      return ApiResponse.notFound(res, 'Ticket not found');
    }

    // Verify the scanner is the organizer of the event
    if (registration.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Not authorized to scan for this event');
    }

    if (registration.status === 'cancelled') {
      return ApiResponse.badRequest(res, 'This registration has been cancelled');
    }

    if (registration.status === 'attended') {
      return ApiResponse.badRequest(res, 'This ticket has already been used');
    }

    // Mark as attended
    registration.status = 'attended';
    registration.attendedAt = new Date();
    await registration.save();

    ApiResponse.success(res, {
      registration,
      attendeeName: registration.user.name,
      attendeeEmail: registration.user.email,
    }, 'Check-in successful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyTickets,
  getEventParticipants,
  verifyQR,
};
