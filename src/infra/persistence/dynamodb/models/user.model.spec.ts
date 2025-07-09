import { UserModel } from './user.model';
import { User } from '@domain/models/User';
import { Video } from '@domain/models/Video';
import { VideoModel } from './video.model';
import { v4 as uuidv4 } from 'uuid';
import { EVideoStatus } from '@domain/models/EVideoStatus';

// Mock uuidv4
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('UserModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fromDomain', () => {
        it('should convert a User domain object to UserModel and generate a new ID if not provided', () => {
            const mockVideoDomain: Video = {
                id: 'v1',
                name: 'Domain Video',
                status: EVideoStatus.UPLOADED,
                url: 'http://domain.com/video.mp4',
                setStatus: jest.fn(),
            };
            const mockUserDomain: User = {
                clientId: 'client123',
                name: 'Test User',
                videos: [mockVideoDomain],
            };

            // Mock VideoModel.fromDomain
            const mockVideoModelInstance = new VideoModel('v1', 'Domain Video', 'UPLOADED', 'http://domain.com/video.mp4');
            jest.spyOn(VideoModel, 'fromDomain').mockReturnValue(mockVideoModelInstance);

            const userModel = UserModel.fromDomain(mockUserDomain);

            expect(userModel).toBeInstanceOf(UserModel);
            expect(userModel.id).toBe('mock-uuid-123'); // Generated ID
            expect(userModel.client_id).toBe('client123');
            expect(userModel.name).toBe('Test User');
            expect(userModel.videos).toEqual([mockVideoModelInstance]);
            expect(uuidv4).toHaveBeenCalledTimes(1);
            expect(VideoModel.fromDomain).toHaveBeenCalledTimes(1);
            expect(VideoModel.fromDomain).toHaveBeenCalledWith(mockVideoDomain);
        });

        it('should convert a User domain object to UserModel and use provided ID', () => {
            const mockVideoDomain: Video = {
                id: 'v2',
                name: 'Another Video',
                status: EVideoStatus.FINISHED,
                url: 'http://another.com/video.mp4',
                setStatus: jest.fn(),
            };
            const mockUserDomain: User = {
                id: 'existing-user-id',
                clientId: 'client456',
                name: 'Existing User',
                videos: [mockVideoDomain],
            };

            // Mock VideoModel.fromDomain
            const mockVideoModelInstance = new VideoModel('v2', 'Another Video', 'FINISHED', 'http://another.com/video.mp4');
            jest.spyOn(VideoModel, 'fromDomain').mockReturnValue(mockVideoModelInstance);

            const userModel = UserModel.fromDomain(mockUserDomain);

            expect(userModel.id).toBe('existing-user-id'); // Provided ID
            expect(uuidv4).not.toHaveBeenCalled();
            expect(VideoModel.fromDomain).toHaveBeenCalledTimes(1);
        });

        it('should handle empty videos array', () => {
            const mockUserDomain: User = {
                clientId: 'client789',
                name: 'User No Videos',
                videos: [],
            };

            jest.spyOn(VideoModel, 'fromDomain'); // Spy to ensure it's not called

            const userModel = UserModel.fromDomain(mockUserDomain);

            expect(userModel.videos).toEqual([]);
            expect(VideoModel.fromDomain).not.toHaveBeenCalled();
        });
    });

    describe('fromDb', () => {
        it('should convert a DynamoDB item to UserModel', () => {
            const mockDbItem = {
                id: 'db-user-id',
                client_id: 'db-client-id',
                name: 'DB User',
                videos: [{ id: 'db-v1', name: 'DB Video', status: 'UPLOADED', url: 'http://db.com/video.mp4' }],
            };

            const userModel = UserModel.fromDb(mockDbItem);

            expect(userModel).toBeInstanceOf(UserModel);
            expect(userModel.id).toBe('db-user-id');
            expect(userModel.client_id).toBe('db-client-id');
            expect(userModel.name).toBe('DB User');
            expect(userModel.videos).toEqual(mockDbItem.videos);
        });
    });

    describe('toDomain', () => {
        it('should convert a UserModel to User domain object', () => {
            const mockVideoModel: VideoModel = new VideoModel('vm1', 'Model Video', 'CONVERTING_TO_FPS', 'http://model.com/video.mp4');
            const mockUserModel: UserModel = {
                id: 'model-user-id',
                client_id: 'model-client-id',
                name: 'Model User',
                videos: [mockVideoModel],
            };

            // Mock VideoModel.toDomain
            const mockVideoDomainInstance: Video = {
                id: 'vm1',
                name: 'Model Video',
                status: EVideoStatus.CONVERTING_TO_FPS,
                url: 'http://model.com/video.mp4',
                setStatus: jest.fn(),
            };
            jest.spyOn(VideoModel, 'toDomain').mockReturnValue(mockVideoDomainInstance);

            const user = UserModel.toDomain(mockUserModel);

            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe('model-user-id');
            expect(user.clientId).toBe('model-client-id');
            expect(user.name).toBe('Model User');
            expect(user.videos).toEqual([mockVideoDomainInstance]);
            expect(VideoModel.toDomain).toHaveBeenCalledTimes(1);
            expect(VideoModel.toDomain).toHaveBeenCalledWith(mockVideoModel);
        });

        it('should handle empty videos array when converting to domain', () => {
            const mockUserModel: UserModel = {
                id: 'model-user-id',
                client_id: 'model-client-id',
                name: 'Model User',
                videos: [],
            };

            jest.spyOn(VideoModel, 'toDomain'); // Spy to ensure it's not called

            const user = UserModel.toDomain(mockUserModel);

            expect(user.videos).toEqual([]);
            expect(VideoModel.toDomain).not.toHaveBeenCalled();
        });
    });
});
