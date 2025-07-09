import { UserLoginController } from './UserLoginController';
import { ILoginUseCase } from '@application/usecases/users/login/ILoginUseCase';
import { HttpRequest, HttpResponse } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';

// Mock ILoginUseCase
const mockExecute = jest.fn();
const mockLoginUseCase: ILoginUseCase = {
    execute: mockExecute,
};

// Mock HttpResponseHandler
jest.mock('@infra/http/protocols/httpResponses', () => ({
    HttpResponseHandler: {
        ok: jest.fn((data: any) => ({ statusCode: 200, body: data })),
        badRequest: jest.fn((error: any) => ({ statusCode: 400, body: error })),
        created: jest.fn((data: any) => ({ statusCode: 201, body: data })),
        unauthorized: jest.fn((error: any) => ({ statusCode: 401, body: error })),
    },
}));

describe('UserLoginController', () => {
    let controller: UserLoginController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new UserLoginController(mockLoginUseCase);
    });

    it('should call loginUseCase.execute with correct parameters and return ok response on successful login', async () => {
        const mockRequest: HttpRequest = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
            query: {},
            params: {},
            headers: {},
        };
        const mockUseCaseResult = { accessToken: 'mock_token' };
        mockExecute.mockResolvedValue(mockUseCaseResult);

        const response = await controller.handle(mockRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
        expect(HttpResponseHandler.ok).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.ok).toHaveBeenCalledWith(mockUseCaseResult);
        expect(response).toEqual({ statusCode: 200, body: mockUseCaseResult });
    });

    it('should return badRequest if email is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {
                password: 'password123',
            },
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledWith('Email and password are required');
        expect(response).toEqual({ statusCode: 400, body: 'Email and password are required' });
    });

    it('should return badRequest if password is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {
                email: 'test@example.com',
            },
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledWith('Email and password are required');
        expect(response).toEqual({ statusCode: 400, body: 'Email and password are required' });
    });
});
