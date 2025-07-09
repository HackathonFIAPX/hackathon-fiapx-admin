import { RouterAdapter } from './RouterAdapter';
import { IController } from '../protocols/controller';
import { HttpRequest, HttpResponse } from '../protocols/http';
import { Request, Response, NextFunction } from 'express';

describe('RouterAdapter', () => {
    let mockController: IController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockController = {
            handle: jest.fn(),
        };
        mockRequest = {
            body: { key: 'value' },
            params: { id: '123' },
            query: { search: 'test' },
            headers: { authorization: 'Bearer token' },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            set: jest.fn(),
        };
        mockNext = jest.fn();
    });

    it('should adapt a controller to an Express middleware and handle success with headers', async () => {
        const httpResponse: HttpResponse = {
            statusCode: 200,
            body: { message: 'Success' },
            headers: { 'Content-Type': 'application/json' },
        };
        (mockController.handle as jest.Mock).mockResolvedValueOnce(httpResponse);

        const middleware = RouterAdapter.adapt(mockController);
        await middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockController.handle).toHaveBeenCalledWith({
            body: mockRequest.body,
            params: mockRequest.params,
            query: mockRequest.query,
            headers: mockRequest.headers,
        });
        expect(mockResponse.set).toHaveBeenCalledWith(httpResponse.headers);
        expect(mockResponse.status).toHaveBeenCalledWith(httpResponse.statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith(httpResponse.body);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should adapt a controller to an Express middleware and handle success without headers', async () => {
        const httpResponse: HttpResponse = {
            statusCode: 200,
            body: { message: 'Success' },
        };
        (mockController.handle as jest.Mock).mockResolvedValueOnce(httpResponse);

        const middleware = RouterAdapter.adapt(mockController);
        await middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockController.handle).toHaveBeenCalledWith({
            body: mockRequest.body,
            params: mockRequest.params,
            query: mockRequest.query,
            headers: mockRequest.headers,
        });
        expect(mockResponse.set).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(httpResponse.statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith(httpResponse.body);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should call next() even if controller.handle throws an error', async () => {
        const error = new Error('Controller error');
        (mockController.handle as jest.Mock).mockRejectedValueOnce(error);

        const middleware = RouterAdapter.adapt(mockController);
        await middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.set).not.toHaveBeenCalled();
    });
});