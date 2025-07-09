import { UserSignUpController } from './UserSignUpController';
import { ISignUpUseCase } from '@application/usecases/users/signup/ISignUpUseCase';
import { HttpRequest, HttpResponse } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';

// Mock ISignUpUseCase
const mockExecute = jest.fn();
const mockSignUpUseCase: ISignUpUseCase = {
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

describe('UserSignUpController', () => {
    let controller: UserSignUpController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new UserSignUpController(mockSignUpUseCase);
    });

    it('should call signUpUseCase.execute with correct parameters and return created response on successful signup', async () => {
        const mockRequest: HttpRequest = {
            body: {
                email: 'newuser@example.com',
                password: 'newpassword123',
            },
            query: {},
            params: {},
            headers: {},
        };
        mockExecute.mockResolvedValue(undefined); // SignUp use case might not return anything specific

        const response = await controller.handle(mockRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({
            email: 'newuser@example.com',
            password: 'newpassword123',
        });
        expect(HttpResponseHandler.created).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.created).toHaveBeenCalledWith({
            email: 'newuser@example.com',
            password: 'newpassword123',
        });
        expect(response).toEqual({ statusCode: 201, body: { email: 'newuser@example.com', password: 'newpassword123' } });
    });

    it('should return badRequest if email is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {
                password: 'newpassword123',
            },
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledWith('Email, password and name are required');
        expect(response).toEqual({ statusCode: 400, body: 'Email, password and name are required' });
    });

    it('should return badRequest if password is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {
                email: 'newuser@example.com',
            },
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledWith('Email, password and name are required');
        expect(response).toEqual({ statusCode: 400, body: 'Email, password and name are required' });
    });
});
