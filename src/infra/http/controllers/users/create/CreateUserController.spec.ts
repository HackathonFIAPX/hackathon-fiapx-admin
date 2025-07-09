import { CreateUserController } from './CreateUserController';
import { ICreateUserUseCase } from '@application/usecases/users/create/ICreateUserUseCase';
import { HttpRequest, HttpResponse } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';

// Mock ICreateUserUseCase
const mockExecute = jest.fn();
const mockCreateUserUseCase: ICreateUserUseCase = {
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

describe('CreateUserController', () => {
    let controller: CreateUserController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new CreateUserController(mockCreateUserUseCase);
    });

    it('should call createUserUseCase.execute with correct parameters and return created response on successful creation', async () => {
        const mockRequest: HttpRequest = {
            body: {
                clientId: 'client123',
                name: 'John Doe',
            },
            query: {},
            params: {},
            headers: {},
        };
        const mockUseCaseResult = { id: 'user123', clientId: 'client123', name: 'John Doe', videos: [] as any };
        mockExecute.mockResolvedValue(mockUseCaseResult);

        const response = await controller.handle(mockRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({
            clientId: 'client123',
            name: 'John Doe',
        });
        expect(HttpResponseHandler.created).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.created).toHaveBeenCalledWith(mockUseCaseResult);
        expect(response).toEqual({ statusCode: 201, body: mockUseCaseResult });
    });

    it('should return badRequest if clientId is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {
                name: 'John Doe',
            },
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledWith('Missing required fields: clientId and name.');
        expect(response).toEqual({ statusCode: 400, body: 'Missing required fields: clientId and name.' });
    });

    it('should return badRequest if name is missing', async () => {
        const mockRequest: HttpRequest = {
            body: {
                clientId: 'client123',
            },
            query: {},
            params: {},
            headers: {},
        };

        const response = await controller.handle(mockRequest);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.badRequest).toHaveBeenCalledWith('Missing required fields: clientId and name.');
        expect(response).toEqual({ statusCode: 400, body: 'Missing required fields: clientId and name.' });
    });
});
