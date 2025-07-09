import { GetPresignedUrlController } from './GetPresignedUrlController';
import { IGetPreSignedUrlUseCase } from '@application/usecases/upload/GetPreSignedUrl/IGetPreSignedUrlUseCase';
import { HttpRequest, HttpResponse } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';

// Mock IGetPreSignedUrlUseCase
const mockExecute = jest.fn();
const mockGetPresignedUrlUseCase: IGetPreSignedUrlUseCase = {
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

describe('GetPresignedUrlController', () => {
    let controller: GetPresignedUrlController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new GetPresignedUrlController(mockGetPresignedUrlUseCase);
    });

    it('should call getPresignedUrl.execute with correct parameters and return ok response', async () => {
        const mockRequest: HttpRequest = {
            query: {
                fileType: 'image/jpeg',
                contentLength: 1024,
            },
            body: {},
            params: {},
            headers: {},
        };
        const mockUseCaseResponse = { url: 'http://presigned.url' };
        mockExecute.mockResolvedValue(mockUseCaseResponse);

        const response = await controller.handle(mockRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({
            fileType: 'image/jpeg',
            contentLength: 1024,
        });
        expect(HttpResponseHandler.ok).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.ok).toHaveBeenCalledWith(mockUseCaseResponse);
        expect(response).toEqual({ statusCode: 200, body: mockUseCaseResponse });
    });
});
