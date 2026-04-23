const ApiResponse = require('../../src/utils/apiResponse');

describe('ApiResponse Utility', () => {
  let mockRes;

  beforeEach(() => {
    // Mock the Express response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should return a 200 status with default message', () => {
      ApiResponse.success(mockRes, { user: 'test' });
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { user: 'test' },
      });
    });

    it('should return custom status and message', () => {
      ApiResponse.success(mockRes, null, 'Custom message', 202);
      
      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Custom message',
        data: null,
      });
    });
  });

  describe('created', () => {
    it('should return a 201 status', () => {
      ApiResponse.created(mockRes, { id: 1 });
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created successfully',
        data: { id: 1 },
      });
    });
  });

  describe('error', () => {
    it('should return a 500 status by default', () => {
      ApiResponse.error(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error',
        errors: null,
      });
    });
  });

  describe('badRequest', () => {
    it('should return a 400 status with errors', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      ApiResponse.badRequest(mockRes, 'Validation Failed', errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Failed',
        errors: errors,
      });
    });
  });

  describe('paginated', () => {
    it('should return correctly formatted pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      ApiResponse.paginated(mockRes, data, 2, 10, 25);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          pages: 3, // Math.ceil(25 / 10)
        },
      });
    });
  });
});
