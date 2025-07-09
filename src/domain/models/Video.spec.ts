import { Video } from './Video';
import { EVideoStatus } from './EVideoStatus'; // Import the enum

describe('Video', () => {
    it('should create a Video instance with correct properties', () => {
        const video = new Video(); // Instantiate the class
        video.id = 'video123';
        video.name = 'My Awesome Video';
        video.status = EVideoStatus.UPLOAD_PENDING;
        video.url = 'http://example.com/video123.mp4';

        expect(video).toBeDefined();
        expect(video.id).toBe('video123');
        expect(video.name).toBe('My Awesome Video');
        expect(video.status).toBe(EVideoStatus.UPLOAD_PENDING);
        expect(video.url).toBe('http://example.com/video123.mp4');
    });

    describe('setStatus', () => {
        let video: Video;

        beforeEach(() => {
            video = new Video(); // Instantiate the class
            video.id = 'video123';
            video.name = 'Test Video';
            video.status = EVideoStatus.UPLOAD_PENDING;
            video.url = 'http://example.com/test.mp4';
        });

        it('should change status from UPLOAD_PENDING to UPLOADED', () => {
            video.setStatus(EVideoStatus.UPLOADED);
            expect(video.status).toBe(EVideoStatus.UPLOADED);
        });

        it('should change status from UPLOADED to CONVERTING_TO_FPS', () => {
            video.status = EVideoStatus.UPLOADED;
            video.setStatus(EVideoStatus.CONVERTING_TO_FPS);
            expect(video.status).toBe(EVideoStatus.CONVERTING_TO_FPS);
        });

        it('should change status from CONVERTING_TO_FPS to FINISHED', () => {
            video.status = EVideoStatus.CONVERTING_TO_FPS;
            video.setStatus(EVideoStatus.FINISHED);
            expect(video.status).toBe(EVideoStatus.FINISHED);
        });

        it('should throw an error when changing status from UPLOAD_PENDING to FINISHED (invalid transition)', () => {
            expect(() => video.setStatus(EVideoStatus.FINISHED)).toThrow(
                `Cannot change status from ${EVideoStatus.UPLOAD_PENDING} to ${EVideoStatus.FINISHED}`,
            );
            expect(video.status).toBe(EVideoStatus.UPLOAD_PENDING); // Status should not change
        });

        it('should throw an error when changing status from FINISHED to any other status', () => {
            video.status = EVideoStatus.FINISHED;
            expect(() => video.setStatus(EVideoStatus.UPLOADED)).toThrow(
                `Cannot change status from ${EVideoStatus.FINISHED} to ${EVideoStatus.UPLOADED}`,
            );
            expect(video.status).toBe(EVideoStatus.FINISHED); // Status should not change
        });

        it('should throw an error when changing status to the same status if not allowed', () => {
            // UPLOAD_PENDING to UPLOAD_PENDING is not in availableChanges
            expect(() => video.setStatus(EVideoStatus.UPLOAD_PENDING)).toThrow(
                `Cannot change status from ${EVideoStatus.UPLOAD_PENDING} to ${EVideoStatus.UPLOAD_PENDING}`,
            );
            expect(video.status).toBe(EVideoStatus.UPLOAD_PENDING);
        });
    });
});