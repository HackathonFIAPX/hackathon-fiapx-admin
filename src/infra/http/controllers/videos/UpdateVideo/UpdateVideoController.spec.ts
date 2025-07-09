import { UpdateVideoController } from './UpdateVideoController';
import { IUpdateVideoUseCase } from '@application/usecases/videos/UpdateVideo/IUpdateVideoUseCase';
import { HttpRequest } from '@infra/http/protocols/http';
import { HttpResponseHandler } from '@infra/http/protocols/httpResponses';
import { Video } from '@domain/models/Video';
import { EVideoStatus } from '@domain/models/EVideoStatus';

const mockExecute = jest.fn();
const mockUpdateVideoUseCase: IUpdateVideoUseCase = {
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

describe('UpdateVideoController', () => {
    let controller: UpdateVideoController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new UpdateVideoController(mockUpdateVideoUseCase);
    });

    it('should call use case with correct data and return updated video', async () => {
        const request: Partial<HttpRequest> = {
            body: {
                videoId: 'video-123',
                status: EVideoStatus.FINISHED,
            },
            tokenInfo: {
                isValid: true,
                payload: {
                    client_id: 'client-123',
                },
            },
        };

        const mockUpdatedVideo = new Video();
        mockUpdatedVideo.id = 'video-123';
        mockUpdatedVideo.status = EVideoStatus.FINISHED;

        mockExecute.mockResolvedValue(mockUpdatedVideo);

        const httpResponse = await controller.handle(request as HttpRequest);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith({
            clientId: 'client-123',
            videoId: 'video-123',
            status: EVideoStatus.FINISHED,
        });

        expect(HttpResponseHandler.ok).toHaveBeenCalledTimes(1);
        expect(HttpResponseHandler.ok).toHaveBeenCalledWith(mockUpdatedVideo);

        expect(httpResponse).toEqual({
            statusCode: 200,
            body: mockUpdatedVideo,
        });
    });
});
