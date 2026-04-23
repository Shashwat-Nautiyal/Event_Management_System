const mongoose = require('mongoose');

// Mock uuid to fix Jest ESM import error
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234-5678',
}));

// Start the in-memory database before all tests
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/campus_events_test';

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
  await mongoose.connection.dropDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
