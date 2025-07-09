import { VideoModel } from './video.model';
import { Video } from '@domain/models/Video';
import { EVideoStatus } from '@domain/models/EVideoStatus';

describe('VideoModel', () => {
    describe('constructor', () => {
        it('should create a VideoModel instance with correct properties', () => {
            const videoModel = new VideoModel('v1', 'Test Video', 'UPLOADED', 'http://test.com/video.mp4');
            expect(videoModel.id).toBe('v1');
            expect(videoModel.name).toBe('Test Video');
            expect(videoModel.status).toBe('UPLOADED');
            expect(videoModel.url).toBe('http://test.com/video.mp4');
        });
    });

    describe('fromDomain', () => {
        it('should convert a Video domain object to VideoModel', () => {
            const domainVideo: Video = {
                id: 'domain-v1',
                name: 'Domain Video',
                status: EVideoStatus.CONVERTING_TO_FPS,
                url: 'http://domain.com/video.mp4',
                setStatus: jest.fn(),
            };

            const videoModel = VideoModel.fromDomain(domainVideo);

            expect(videoModel).toBeInstanceOf(VideoModel);
            expect(videoModel.id).toBe('domain-v1');
            expect(videoModel.name).toBe('Domain Video');
            expect(videoModel.status).toBe(EVideoStatus.CONVERTING_TO_FPS); // Status should be string in model
            expect(videoModel.url).toBe('http://domain.com/video.mp4');
        });
    });

    describe('toDomain', () => {
        it('should convert a VideoModel to Video domain object', () => {
            const videoModel = new VideoModel('model-v1', 'Model Video', 'FINISHED', 'http://model.com/video.mp4');

            const domainVideo = VideoModel.toDomain(videoModel);

            expect(domainVideo).toBeInstanceOf(Video);
            expect(domainVideo.id).toBe('model-v1');
            expect(domainVideo.name).toBe('Model Video');
            expect(domainVideo.status).toBe(EVideoStatus.FINISHED); // Status should be enum in domain
            expect(domainVideo.url).toBe('http://model.com/video.mp4');
        });
    });
});
