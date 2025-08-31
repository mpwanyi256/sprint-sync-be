import {
  ApiError,
  ErrorType,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  InternalError,
  AuthFailureError,
} from '../../../core/ApiErrors';

describe('ApiError', () => {
  describe('BadRequestError', () => {
    it('should create error with correct type and message', () => {
      const message = 'Invalid request data';
      const error = new BadRequestError(message);

      expect(error.type).toBe(ErrorType.BAD_REQUEST);
      expect(error.message).toBe(message);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with correct type and default message', () => {
      const error = new NotFoundError();

      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.message).toBe('Not Found');
      expect(error).toBeInstanceOf(ApiError);
    });

    it('should create error with custom message', () => {
      const message = 'User not found';
      const error = new NotFoundError(message);

      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.message).toBe(message);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with correct type and default message', () => {
      const error = new ForbiddenError();

      expect(error.type).toBe(ErrorType.FORBIDDEN);
      expect(error.message).toBe('Permission denied');
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('InternalError', () => {
    it('should create error with correct type and default message', () => {
      const error = new InternalError();

      expect(error.type).toBe(ErrorType.INTERNAL);
      expect(error.message).toBe('Internal error');
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('AuthFailureError', () => {
    it('should create error with correct type and default message', () => {
      const error = new AuthFailureError();

      expect(error.type).toBe(ErrorType.UNAUTHORIZED);
      expect(error.message).toBe('Invalid Credentials');
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('ApiError.handle', () => {
    it('should handle error and send response', () => {
      const error = new BadRequestError('Test error');
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const result = ApiError.handle(error, mockRes as any);

      expect(result).toBeDefined();
      expect(mockRes.status).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
