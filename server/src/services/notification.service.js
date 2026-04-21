const Notification = require('../models/Notification');
const firebase = require('../config/firebase');

const createNotification = async ({ recipient, event, title, message, type }) => {
  try {
    const notification = await Notification.create({
      recipient,
      event: event || null,
      title,
      message,
      type: type || 'general',
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return null;

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data,
    };
    const response = await firebase.messaging.send(message);
    return response;
  } catch (error) {
    console.error('Push notification error:', error.message);
    return null;
  }
};

const notifyEventRegistrants = async (eventId, title, message, type = 'update') => {
  const Registration = require('../models/Registration');

  try {
    const registrations = await Registration.find({
      event: eventId,
      status: { $ne: 'cancelled' },
    }).populate('user', 'fcmToken');

    const notifications = registrations.map((reg) =>
      createNotification({
        recipient: reg.user._id,
        event: eventId,
        title,
        message,
        type,
      })
    );

    await Promise.all(notifications);

    // Send push notifications to users with FCM tokens
    const pushPromises = registrations
      .filter((reg) => reg.user.fcmToken)
      .map((reg) =>
        sendPushNotification(reg.user.fcmToken, title, message, {
          eventId: eventId.toString(),
        })
      );

    await Promise.all(pushPromises);

    return { sent: registrations.length };
  } catch (error) {
    console.error('Notify registrants error:', error.message);
    return { sent: 0 };
  }
};

module.exports = {
  createNotification,
  sendPushNotification,
  notifyEventRegistrants,
};
