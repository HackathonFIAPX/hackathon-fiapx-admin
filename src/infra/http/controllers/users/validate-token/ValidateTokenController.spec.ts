import { ValidateTokenController } from './ValidateTokenController';
import { IValidateTokenUseCase } from '@application/usecases/users/validate-token/IValidateTokenUseCase';
import { HttpRequest, HttpResponse } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';

// Mock IValidateTokenUseCase
const mockExecute = jest.fn();
const mockValidateTokenUseCase: IValidateTokenUseCase = {
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

describe('ValidateTokenController', () => {
    let controller: ValidateTokenController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new ValidateTokenController(mockValidateTokenUseCase);
    });

    it('should call validateTokenUseCase.execute with correct parameters and return ok response on valid token', async () => {
        const mockRequest: HttpRequest = {
            body: {
                token: 'valid_token',
            },
            query: {},
            params: {},
            headers: {},
        };
        const mockUseCaseResult = { isValid: true, data: { userId: '123' } };
        mockExecute.mockResolvedValue(mockUseCaseResult);

        const response = await controller.handle(mockRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({ token: 'valid_token' });
        expect(HttpResponseHandler.ok).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.ok).toHaveBeenCalledWith(mockUseCaseResult);
        expect(response).toEqual({ statusCode: 200, body: mockUseCaseResult });
    });

    it('should call validateTokenUseCase.execute with correct parameters and return unauthorized response on invalid token', async () => {
        const mockRequest: HttpRequest = {
            body: {
                token: 'invalid_token',
            },
            query: {},
            params: {},
            headers: {},
        };
        const mockUseCaseResult = { isValid: false, error: 'Invalid token' };
        mockExecute.mockResolvedValue(mockUseCaseResult);

        const response = await controller.handle(mockRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({ token: 'invalid_token' });
        expect(HttpResponseHandler.unauthorized).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.unauthorized).toHaveBeenCalledWith(mockUseCaseResult);
        expect(response).toEqual({ statusCode: 401, body: mockUseCaseResult });
    });

    it('should return 400 if token is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {},
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.ok).not.toHaveBeenCalled();
        expect(HttpResponseHandler.unauthorized).not.toHaveBeenCalled();
        expect(response).toEqual({
            statusCode: 400,
            body: { error: 'Token is required.' },
        });
    });
});
