import { AuthMiddleware } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ICognitoToken } from '@infra/aws/cognito/CognitoToken/ICognitoToken';

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let mockCognitoToken: jest.Mocked<ICognitoToken>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    mockCognitoToken = {
      validateToken: jest.fn(),
    };
    container.register<ICognitoToken>('ICognitoToken', { useValue: mockCognitoToken });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if authorization header is missing', async () => {
    await AuthMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    mockRequest.headers = { authorization: 'Basic some_token' };
    await AuthMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    mockCognitoToken.validateToken.mockResolvedValue({ isValid: false, error: 'Invalid token' });
    await AuthMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token validation returns no info', async () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    mockCognitoToken.validateToken.mockResolvedValue(null);
    await AuthMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next and attach tokenInfo if token is valid', async () => {
    const tokenInfo = { isValid: true, username: 'testuser' };
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    mockCognitoToken.validateToken.mockResolvedValue(tokenInfo);
    await AuthMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockRequest.tokenInfo).toBe(tokenInfo);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
