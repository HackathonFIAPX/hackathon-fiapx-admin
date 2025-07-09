import { UpdateVideoUseCase } from './UpdateVideoUseCase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/models/User';
import { Video } from '@domain/models/Video';
import { EVideoStatus } from '@domain/models/EVideoStatus';
import { TUpdateVideoUseCaseInput } from './TUpdateVideoUseCase';

const mockFindByClientId = jest.fn();
const mockUpdateVideo = jest.fn();
const mockUserRepository: IUserRepository = {
    findByClientId: mockFindByClientId,
    updateVideo: mockUpdateVideo,
    save: jest.fn(),
    addVideoToUser: jest.fn(),
};

describe('UpdateVideoUseCase', () => {
    let useCase: UpdateVideoUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateVideoUseCase(mockUserRepository);
    });

    it('should update a video status and return the updated video', async () => {
        const input: TUpdateVideoUseCaseInput = {
            clientId: 'client-123',
            videoId: 'video-123',
            status: EVideoStatus.CONVERTING_TO_FPS,
        };

        const mockVideo = new Video();
        mockVideo.id = 'video-123';
        mockVideo.status = EVideoStatus.UPLOADED;
        mockVideo.setStatus = jest.fn();

        const mockUser = new User();
        mockUser.videos = [mockVideo];

        mockFindByClientId.mockResolvedValue(mockUser);
        mockUpdateVideo.mockResolvedValue(mockVideo);

        const result = await useCase.execute(input);

        expect(mockFindByClientId).toHaveBeenCalledWith(input.clientId);
        expect(mockVideo.setStatus).toHaveBeenCalledWith(input.status);
        expect(mockUpdateVideo).toHaveBeenCalledWith(input.clientId, mockVideo);
        expect(result).toBe(mockVideo);
    });

    it('should throw an error if user is not found', async () => {
        const input: TUpdateVideoUseCaseInput = {
            clientId: 'non-existent-client',
            videoId: 'video-123',
            status: EVideoStatus.CONVERTING_TO_FPS,
        };

        mockFindByClientId.mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow('User not found');
    });

    it('should throw an error if video is not found', async () => {
        const input: TUpdateVideoUseCaseInput = {
            clientId: 'client-123',
            videoId: 'non-existent-video',
            status: EVideoStatus.CONVERTING_TO_FPS,
        };

        const mockUser = new User();
        mockUser.videos = [];

        mockFindByClientId.mockResolvedValue(mockUser);

        await expect(useCase.execute(input)).rejects.toThrow();
    });

    it('should throw an error if user has no videos array', async () => {
        const input: TUpdateVideoUseCaseInput = {
            clientId: 'client-123',
            videoId: 'video-123',
            status: EVideoStatus.CONVERTING_TO_FPS,
        };

        const mockUser = new User();
        mockUser.videos = null;

        mockFindByClientId.mockResolvedValue(mockUser);

        await expect(useCase.execute(input)).rejects.toThrow();
    });

    it('should propagate error from setStatus', async () => {
        const input: TUpdateVideoUseCaseInput = {
            clientId: 'client-123',
            videoId: 'video-123',
            status: EVideoStatus.FINISHED, // Invalid transition
        };

        const mockVideo = new Video();
        mockVideo.id = 'video-123';
        mockVideo.status = EVideoStatus.UPLOADED;
        mockVideo.setStatus = jest.fn(() => { throw new Error('Invalid status transition'); });

        const mockUser = new User();
        mockUser.videos = [mockVideo];

        mockFindByClientId.mockResolvedValue(mockUser);

        await expect(useCase.execute(input)).rejects.toThrow('Invalid status transition');
    });
});
