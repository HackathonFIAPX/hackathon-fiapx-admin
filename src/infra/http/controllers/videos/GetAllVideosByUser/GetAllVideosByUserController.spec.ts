import { GetAllVideosByUserController } from './GetAllVideosByUserController';
import { IGetAllVideosByUserUseCase } from '@application/usecases/videos/GetAllVideosByUser/IGetAllVideosByUserUseCase';
import { HttpRequest } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';
import { Video } from '@domain/models/Video';
import { EVideoStatus } from '@domain/models/EVideoStatus';

const mockExecute = jest.fn();
const mockGetAllVideosByUserUseCase: IGetAllVideosByUserUseCase = {
    execute: mockExecute,
};

jest.mock('@infra/http/protocols/httpResponses', () => ({
    HttpResponseHandler: {
        ok: jest.fn((data) => ({
            statusCode: 200,
            body: data,
        })),
    },
}));

describe('GetAllVideosByUserController', () => {
    let controller: GetAllVideosByUserController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new GetAllVideosByUserController(mockGetAllVideosByUserUseCase);
    });

    it('should call use case with correct client id and return videos', async () => {
        const request: Partial<HttpRequest> = {
            tokenInfo: {
                isValid: true,
                payload: {
                    client_id: 'test-client-id',
                },
            },
        };

        const mockVideos: Video[] = [
            { id: '1', name: 'Video 1', status: EVideoStatus.UPLOADED, url: 'url1', setStatus: jest.fn() },
            { id: '2', name: 'Video 2', status: EVideoStatus.UPLOADED, url: 'url2', setStatus: jest.fn() },
        ];
        mockExecute.mockResolvedValue(mockVideos);

        const httpResponse = await controller.handle(request as HttpRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({ clientId: 'test-client-id' });

        expect(HttpResponseHandler.ok).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.ok).toHaveBeenCalledWith(mockVideos);

        expect(httpResponse).toEqual({
            statusCode: 200,
            body: mockVideos,
        });
    });
});
