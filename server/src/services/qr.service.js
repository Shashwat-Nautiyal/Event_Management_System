const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateTicketId = () => {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateQRData = (ticketId, eventId, userId) => {
  return JSON.stringify({
    ticketId,
    eventId,
    userId,
    timestamp: Date.now(),
  });
};

const generateQRCodeDataURL = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

const verifyQRData = (qrData) => {
  try {
    const parsed = JSON.parse(qrData);
    if (!parsed.ticketId || !parsed.eventId || !parsed.userId) {
      return { valid: false, error: 'Invalid QR code data' };
    }
    return { valid: true, data: parsed };
  } catch (error) {
    return { valid: false, error: 'Invalid QR code format' };
  }
};

module.exports = {
  generateTicketId,
  generateQRData,
  generateQRCodeDataURL,
  verifyQRData,
};
