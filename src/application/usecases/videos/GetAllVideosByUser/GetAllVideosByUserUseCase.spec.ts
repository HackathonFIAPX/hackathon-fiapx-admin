import { GetAllVideosByUserUseCase } from './GetAllVideosByUserUseCase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/models/User';
import { Video } from '@domain/models/Video';
import { EVideoStatus } from '@domain/models/EVideoStatus';
import { TGetAllVideosByUserUseCaseInput } from './TGetAllVideosByUserUseCase';

const mockFindByClientId = jest.fn();
const mockUserRepository: IUserRepository = {
    findByClientId: mockFindByClientId,
    save: jest.fn(),
    addVideoToUser: jest.fn(),
    updateVideo: jest.fn(),
};

describe('GetAllVideosByUserUseCase', () => {
    let useCase: GetAllVideosByUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetAllVideosByUserUseCase(mockUserRepository);
    });

    it('should return all videos for a given user', async () => {
        const input: TGetAllVideosByUserUseCaseInput = { clientId: 'user-with-videos' };

        const mockUser = new User();
        mockUser.clientId = input.clientId;
        const mockVideo = new Video();
        mockVideo.id = 'video-123';
        mockVideo.name = 'Test Video';
        mockVideo.status = EVideoStatus.UPLOADED;
        mockVideo.url = 'http://videos.com/video.mp4';
        mockUser.videos = [mockVideo];

        mockFindByClientId.mockResolvedValue(mockUser);

        const result = await useCase.execute(input);

        expect(mockFindByClientId).toHaveBeenCalledWith(input.clientId);
        expect(result).toEqual([mockVideo]);
    });

    it('should return an empty array if user has no videos', async () => {
        const input: TGetAllVideosByUserUseCaseInput = { clientId: 'user-with-no-videos' };

        const mockUser = new User();
        mockUser.clientId = input.clientId;
        mockUser.videos = [];

        mockFindByClientId.mockResolvedValue(mockUser);

        const result = await useCase.execute(input);

        expect(mockFindByClientId).toHaveBeenCalledWith(input.clientId);
        expect(result).toEqual([]);
    });

    it('should return an empty array if user videos property is null or undefined', async () => {
        const input: TGetAllVideosByUserUseCaseInput = { clientId: 'user-with-null-videos' };

        const mockUser = new User();
        mockUser.clientId = input.clientId;
        mockUser.videos = null as any;

        mockFindByClientId.mockResolvedValue(mockUser);

        const result = await useCase.execute(input);

        expect(mockFindByClientId).toHaveBeenCalledWith(input.clientId);
        expect(result).toEqual([]);
    });

    it('should throw an error if user is not found', async () => {
        const input: TGetAllVideosByUserUseCaseInput = { clientId: 'non-existent-user' };

        mockFindByClientId.mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow('User not found');
        expect(mockFindByClientId).toHaveBeenCalledWith(input.clientId);
    });
});
