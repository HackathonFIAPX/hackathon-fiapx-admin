import { User } from './User';
import { Video } from './Video'; // Assuming Video model is also tested and works
import { EVideoStatus } from './EVideoStatus';

describe('User', () => {
    it('should create a User instance with correct properties', () => {
        const mockVideo1: Video = { id: 'v1', name: 'Video 1', status: EVideoStatus.UPLOADED, url: 'url1', setStatus: jest.fn() };
        const mockVideo2: Video = { id: 'v2', name: 'Video 2', status: EVideoStatus.FINISHED, url: 'url2', setStatus: jest.fn() };

        const user: User = {
            id: 'user123',
            clientId: 'clientABC',
            name: 'John Doe',
            videos: [mockVideo1, mockVideo2],
        };

        expect(user).toBeDefined();
        expect(user.id).toBe('user123');
        expect(user.clientId).toBe('clientABC');
        expect(user.name).toBe('John Doe');
        expect(user.videos).toEqual([mockVideo1, mockVideo2]);
        expect(user.videos.length).toBe(2);
    });

    it('should create a User instance with optional id and empty videos array', () => {
        const user: User = {
            clientId: 'clientXYZ',
            name: 'Jane Smith',
            videos: [],
        };

        expect(user).toBeDefined();
        expect(user.id).toBeUndefined();
        expect(user.clientId).toBe('clientXYZ');
        expect(user.name).toBe('Jane Smith');
        expect(user.videos).toEqual([]);
    });
});
