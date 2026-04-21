// Firebase Admin SDK setup — stubbed for now
// To enable push notifications, add your Firebase service account key
// and uncomment the initialization below.

// const admin = require('firebase-admin');
// const serviceAccount = require('../../firebase-service-account.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;

module.exports = {
  messaging: {
    send: async (message) => {
      console.log('📱 [Firebase Stub] Push notification:', message);
      return { messageId: 'stub-' + Date.now() };
    },
  },
};
