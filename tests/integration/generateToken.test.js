const jwt = require('jsonwebtoken');
const tokenUtils = require('../../src/utils/generateToken');

// Mock the environment variables so tests are predictable and don't rely on the .env file
jest.mock('../../src/config/env', () => ({
  JWT_SECRET: 'test-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_EXPIRE: '1h',
  JWT_REFRESH_EXPIRE: '7d',
}));

describe('Token Generation Utility', () => {
  const userId = '12345';

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = tokenUtils.generateAccessToken(userId);
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, 'test-secret');
      expect(decoded.id).toBe(userId);
      expect(decoded.exp).toBeDefined(); // Should have an expiration
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = tokenUtils.generateRefreshToken(userId);
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, 'test-refresh-secret');
      expect(decoded.id).toBe(userId);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyAccessToken', () => {
    it('should correctly verify a valid access token', () => {
      const token = jwt.sign({ id: userId }, 'test-secret', { expiresIn: '1h' });
      
      const decoded = tokenUtils.verifyAccessToken(token);
      expect(decoded.id).toBe(userId);
    });

    it('should throw an error for an invalid access token', () => {
      const invalidToken = 'invalid.token.string';
      
      expect(() => {
        tokenUtils.verifyAccessToken(invalidToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should correctly verify a valid refresh token', () => {
      const token = jwt.sign({ id: userId }, 'test-refresh-secret', { expiresIn: '7d' });
      
      const decoded = tokenUtils.verifyRefreshToken(token);
      expect(decoded.id).toBe(userId);
    });
  });
});
